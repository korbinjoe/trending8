import type { FeedPeriod, RepoDetail } from "@github-trending/core/types";
import { buildStarHistoryUrl } from "@github-trending/core";
import { getAlternativesForRepo } from "@github-trending/github";
import { getDb } from "@github-trending/db";
import {
  periodMetrics,
  rankingRuns,
  repositories,
  repositorySnapshots,
} from "@github-trending/db";
import { and, desc, eq } from "drizzle-orm";
import {
  compareUrl,
  githubRepoUrl,
  librariesIoUrl,
  ossInsightUrl,
} from "./site";

const DEFAULT_PERIOD: FeedPeriod = "today";
const ALT_LIMIT = 5;

export async function getRepoDetail(
  owner: string,
  name: string,
): Promise<RepoDetail | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(repositories)
    .where(eq(repositories.fullName, `${owner}/${name}`))
    .limit(1);

  const repo = rows[0];
  if (!repo) return null;

  const snap = await db
    .select()
    .from(repositorySnapshots)
    .where(eq(repositorySnapshots.repoId, repo.id))
    .orderBy(desc(repositorySnapshots.capturedAt))
    .limit(1);

  const latestRun = await db
    .select()
    .from(rankingRuns)
    .where(
      and(
        eq(rankingRuns.period, DEFAULT_PERIOD),
        eq(rankingRuns.view, "velocity"),
        eq(rankingRuns.status, "completed"),
      ),
    )
    .orderBy(desc(rankingRuns.completedAt))
    .limit(1);

  const run = latestRun[0];
  let metric = null;
  if (run) {
    const metricRows = await db
      .select()
      .from(periodMetrics)
      .where(
        and(
          eq(periodMetrics.repoId, repo.id),
          eq(periodMetrics.rankingRunId, run.id),
        ),
      )
      .limit(1);
    metric = metricRows[0] ?? null;
  }

  const latest = snap[0];
  const topics = (repo.topics as string[]) ?? [];
  const slug = `${repo.owner}/${repo.name}`;

  const altEdges = await getAlternativesForRepo(
    db,
    repo.id,
    DEFAULT_PERIOD,
    ALT_LIMIT,
  );

  const alternatives: RepoDetail["alternatives"] = [];
  for (const edge of altEdges) {
    const candidateRows = await db
      .select()
      .from(repositories)
      .where(eq(repositories.fullName, edge.slug))
      .limit(1);
    const candidate = candidateRows[0];
    if (!candidate) continue;

    const candidateMetric = run
      ? await db
          .select()
          .from(periodMetrics)
          .where(
            and(
              eq(periodMetrics.repoId, candidate.id),
              eq(periodMetrics.rankingRunId, run.id),
            ),
          )
          .limit(1)
      : [];

    const candidateSnap = await db
      .select()
      .from(repositorySnapshots)
      .where(eq(repositorySnapshots.repoId, candidate.id))
      .orderBy(desc(repositorySnapshots.capturedAt))
      .limit(1);

    alternatives.push({
      owner: candidate.owner,
      name: candidate.name,
      slug: edge.slug,
      description: candidate.description ?? "",
      deltaStars: candidateMetric[0]?.deltaStars ?? 0,
      totalStars: candidateSnap[0]?.stars ?? 0,
      health: candidateMetric[0]?.health ?? "low",
      license: candidate.license,
      why: edge.why,
    });
  }

  const compareSlugs = [slug, ...alternatives.map((a) => a.slug)].slice(0, 4);

  return {
    owner: repo.owner,
    name: repo.name,
    slug,
    description: repo.description ?? "",
    deltaStars: metric?.deltaStars ?? 0,
    totalStars: latest?.stars ?? 0,
    health: metric?.health ?? "low",
    tags: topics,
    commits30d: latest?.commits30d ?? 0,
    lastPush: latest?.pushedAt?.toISOString() ?? null,
    license: repo.license,
    language: repo.language,
    isEarlySignal: metric?.isEarlySignal === 1,
    alternatives,
    compareUrl: compareUrl(compareSlugs),
    urls: {
      github: githubRepoUrl(repo.owner, repo.name),
      starHistory: buildStarHistoryUrl([{ owner: repo.owner, name: repo.name }]),
      ossInsight: ossInsightUrl(repo.owner, repo.name),
      librariesIo: librariesIoUrl(repo.owner, repo.name),
      bestOfJs:
        repo.language === "JavaScript" || repo.language === "TypeScript"
          ? "https://bestofjs.org"
          : undefined,
    },
  };
}
