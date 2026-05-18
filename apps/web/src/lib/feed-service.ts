import {
  FeedPeriodSchema,
  FeedViewSchema,
  type FeedItem,
  type FeedResponse,
} from "@github-trending/core/types";
import { getAlternativesForRepo } from "@github-trending/github";
import { getDb } from "@github-trending/db";
import {
  periodMetrics,
  rankingRuns,
  repositories,
} from "@github-trending/db";
import { and, asc, desc, eq } from "drizzle-orm";
import { compareUrl } from "./site";

const PAGE_SIZE = 24;

export async function getFeed(params: {
  view: string;
  period: string;
  lang?: string;
  topic?: string;
  cursor?: string;
  includeNoise?: boolean;
}): Promise<FeedResponse> {
  const view = FeedViewSchema.parse(params.view);
  const period = FeedPeriodSchema.parse(params.period);
  const db = getDb();

  const latestRun = await db
    .select()
    .from(rankingRuns)
    .where(
      and(
        eq(rankingRuns.period, period),
        eq(rankingRuns.view, view),
        eq(rankingRuns.status, "completed"),
      ),
    )
    .orderBy(desc(rankingRuns.completedAt))
    .limit(1);

  const run = latestRun[0];
  if (!run) {
    return { items: [], nextCursor: null, rankingRunId: null, updatedAt: null };
  }

  const offset = params.cursor ? Number.parseInt(params.cursor, 10) : 0;

  const conditions = [
    eq(periodMetrics.rankingRunId, run.id),
    eq(periodMetrics.period, period),
    eq(periodMetrics.view, view),
  ];

  if (params.lang) {
    conditions.push(eq(periodMetrics.language, params.lang));
  }

  const metrics = await db
    .select()
    .from(periodMetrics)
    .where(and(...conditions))
    .orderBy(asc(periodMetrics.velocityRank))
    .offset(offset)
    .limit(PAGE_SIZE + 1);

  const hasMore = metrics.length > PAGE_SIZE;
  const page = hasMore ? metrics.slice(0, PAGE_SIZE) : metrics;

  const items: FeedItem[] = [];

  for (const m of page) {
    const repoRows = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, m.repoId))
      .limit(1);
    const repo = repoRows[0];
    if (!repo) continue;

    const topics = (repo.topics as string[]) ?? [];
    if (params.topic && !topics.some((t) => t.toLowerCase() === params.topic?.toLowerCase())) {
      continue;
    }

    const alternatives = await getAlternativesForRepo(db, repo.id, period, 2);
    const slugs = [
      `${repo.owner}/${repo.name}`,
      ...alternatives.map((a) => a.slug),
    ].slice(0, 4);

    items.push({
      rank: m.velocityRank ?? 0,
      owner: repo.owner,
      name: repo.name,
      slug: `${repo.owner}/${repo.name}`,
      description: repo.description ?? "",
      deltaStars: m.deltaStars,
      totalStars: m.totalStars,
      health: m.health,
      tags: topics.slice(0, 5),
      isEarlySignal: m.isEarlySignal === 1,
      alternatives,
      compareUrl: slugs.length > 1 ? compareUrl(slugs) : undefined,
    });
  }

  return {
    items,
    nextCursor: hasMore ? String(offset + PAGE_SIZE) : null,
    rankingRunId: run.id,
    updatedAt: run.completedAt?.toISOString() ?? null,
  };
}
