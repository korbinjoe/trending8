import type { RepoDetail } from "@github-trending/core/types";
import { buildStarHistoryUrl } from "@github-trending/core";
import { getDb } from "@github-trending/db";
import {
  periodMetrics,
  repositories,
  repositorySnapshots,
} from "@github-trending/db";
import { desc, eq } from "drizzle-orm";
import { githubRepoUrl, ossInsightUrl } from "./site";

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

  const metric = await db
    .select()
    .from(periodMetrics)
    .where(eq(periodMetrics.repoId, repo.id))
    .orderBy(desc(periodMetrics.createdAt))
    .limit(1);

  const latest = snap[0];
  const m = metric[0];
  const topics = (repo.topics as string[]) ?? [];

  return {
    owner: repo.owner,
    name: repo.name,
    slug: `${repo.owner}/${repo.name}`,
    description: repo.description ?? "",
    deltaStars: m?.deltaStars ?? 0,
    totalStars: latest?.stars ?? 0,
    health: m?.health ?? "low",
    tags: topics,
    commits30d: latest?.commits30d ?? 0,
    lastPush: latest?.pushedAt?.toISOString() ?? null,
    license: repo.license,
    language: repo.language,
    urls: {
      github: githubRepoUrl(repo.owner, repo.name),
      starHistory: buildStarHistoryUrl([{ owner: repo.owner, name: repo.name }]),
      ossInsight: ossInsightUrl(repo.owner, repo.name),
      bestOfJs:
        repo.language === "JavaScript" || repo.language === "TypeScript"
          ? "https://bestofjs.org"
          : undefined,
    },
  };
}
