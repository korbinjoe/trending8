import {
  buildRankedRepo,
  computeDeltaStars,
  computeRelativeVelocityPercentile,
  isEarlySignal,
  shouldExclude,
  sortByVelocity,
  type RepoSignals,
} from "@github-trending/core";
import type { FeedPeriod, FeedView } from "@github-trending/core/types";
import type { Database } from "@github-trending/db";
import {
  periodMetrics,
  rankingRuns,
  repositories,
  repositorySnapshots,
} from "@github-trending/db";
import { and, desc, eq, gte } from "drizzle-orm";

const PERIOD_DAYS: Record<FeedPeriod, number> = {
  today: 1,
  week: 7,
  month: 30,
  halfYear: 180,
  year: 365,
};

function periodStart(period: FeedPeriod): Date {
  const days = PERIOD_DAYS[period];
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

interface RepoMetricInput {
  repoId: string;
  owner: string;
  name: string;
  language: string | null;
  deltaStars: number;
  totalStars: number;
  commits30d: number;
}

export interface RankingBatchResult {
  rankingRunId: string;
  reposRanked: number;
  errorCount: number;
}

export async function runRankingBatch(
  db: Database,
  period: FeedPeriod,
  view: FeedView,
): Promise<RankingBatchResult> {
  const [run] = await db
    .insert(rankingRuns)
    .values({ period, view, status: "running" })
    .returning({ id: rankingRuns.id });

  if (!run) throw new Error("Failed to create ranking run");

  try {
    const repos = await db.select().from(repositories);
    const inputs: RepoMetricInput[] = [];
    const since = periodStart(period);

    for (const repo of repos) {
      const signals: RepoSignals = {
        owner: repo.owner,
        name: repo.name,
        topics: (repo.topics as string[]) ?? [],
        commits30d: 0,
        totalStars: 0,
      };

      const latest = await db
        .select()
        .from(repositorySnapshots)
        .where(eq(repositorySnapshots.repoId, repo.id))
        .orderBy(desc(repositorySnapshots.capturedAt))
        .limit(1);

      const previous = await db
        .select()
        .from(repositorySnapshots)
        .where(
          and(
            eq(repositorySnapshots.repoId, repo.id),
            gte(repositorySnapshots.capturedAt, since),
          ),
        )
        .orderBy(repositorySnapshots.capturedAt)
        .limit(1);

      const latestSnap = latest[0];
      const prevSnap = previous[0];
      if (!latestSnap) continue;

      signals.commits30d = latestSnap.commits30d;
      signals.totalStars = latestSnap.stars;
      if (shouldExclude(signals)) continue;

      inputs.push({
        repoId: repo.id,
        owner: repo.owner,
        name: repo.name,
        language: repo.language,
        deltaStars: computeDeltaStars(
          latestSnap.stars,
          prevSnap?.stars ?? latestSnap.stars,
        ),
        totalStars: latestSnap.stars,
        commits30d: latestSnap.commits30d,
      });
    }

    const byLang = new Map<string, number[]>();
    for (const r of inputs) {
      const lang = r.language ?? "unknown";
      const list = byLang.get(lang) ?? [];
      list.push(r.deltaStars);
      byLang.set(lang, list);
    }

    const withRank = inputs.map((r) => {
      const lang = r.language ?? "unknown";
      const pct = computeRelativeVelocityPercentile(
        r.deltaStars,
        byLang.get(lang) ?? [],
      );
      const ranked = buildRankedRepo(
        r.owner,
        r.name,
        r.deltaStars,
        r.totalStars,
        r.commits30d,
        pct,
      );
      ranked.isEarly = isEarlySignal(r.totalStars, pct);
      return { ...r, ranked, percentile: pct };
    });

    let filtered = withRank;
    if (view === "early") {
      filtered = withRank.filter((r) => r.ranked.isEarly);
    }

    const sorted = sortByVelocity(filtered.map((r) => r.ranked));
    const slugToInput = new Map(
      filtered.map((r) => [`${r.owner}/${r.name}`, r]),
    );

    let rank = 1;
    for (const item of sorted) {
      const input = slugToInput.get(`${item.owner}/${item.name}`);
      if (!input) continue;

      await db.insert(periodMetrics).values({
        repoId: input.repoId,
        rankingRunId: run.id,
        period,
        view,
        language: input.language,
        deltaStars: item.deltaStars,
        totalStars: item.totalStars,
        commits30d: input.commits30d,
        health: item.health,
        healthScore: item.healthScoreValue,
        velocityRank: rank++,
        isEarlySignal: item.isEarly ? 1 : 0,
        relativeVelocityPercentile: input.percentile,
      });
    }

    await db
      .update(rankingRuns)
      .set({
        status: "completed",
        completedAt: new Date(),
        reposProcessed: sorted.length,
      })
      .where(eq(rankingRuns.id, run.id));

    return {
      rankingRunId: run.id,
      reposRanked: sorted.length,
      errorCount: 0,
    };
  } catch (err) {
    await db
      .update(rankingRuns)
      .set({ status: "failed", completedAt: new Date(), errorCount: 1 })
      .where(eq(rankingRuns.id, run.id));
    throw err;
  }
}

export async function getLatestRankingRunId(
  db: Database,
): Promise<string | null> {
  const rows = await db
    .select({ id: rankingRuns.id })
    .from(rankingRuns)
    .where(eq(rankingRuns.status, "completed"))
    .orderBy(desc(rankingRuns.completedAt))
    .limit(1);
  return rows[0]?.id ?? null;
}
