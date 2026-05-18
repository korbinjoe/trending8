import {
  CompareResponseSchema,
  type CompareResponse,
} from "@github-trending/core/types";
import {
  buildStarHistoryUrl,
  parseRepoSlug,
  STAR_HISTORY_MAX_REPOS,
} from "@github-trending/core";
import { getDb } from "@github-trending/db";
import {
  alternativesEdges,
  periodMetrics,
  repositories,
  repositorySnapshots,
} from "@github-trending/db";
import { desc, eq, inArray } from "drizzle-orm";

export async function getCompare(
  repoSlugs: string[],
  sort: "health" | "velocity" = "health",
): Promise<CompareResponse | { error: string; status: number }> {
  if (repoSlugs.length > STAR_HISTORY_MAX_REPOS) {
    return {
      error: `Maximum ${STAR_HISTORY_MAX_REPOS} repositories allowed`,
      status: 400,
    };
  }

  const parsed = repoSlugs
    .map(parseRepoSlug)
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (parsed.length === 0) {
    return { error: "No valid repository slugs", status: 400 };
  }

  const db = getDb();
  const fullNames = parsed.map((r) => `${r.owner}/${r.name}`);
  const repos = await db
    .select()
    .from(repositories)
    .where(inArray(repositories.fullName, fullNames));

  const columns = repos.map((r) => ({
    owner: r.owner,
    name: r.name,
    slug: r.fullName,
    repoId: r.id,
    description: r.description ?? "",
    language: r.language,
    license: r.license,
  }));

  const repoData = await Promise.all(
    columns.map(async (col) => {
      const snap = await db
        .select()
        .from(repositorySnapshots)
        .where(eq(repositorySnapshots.repoId, col.repoId))
        .orderBy(desc(repositorySnapshots.capturedAt))
        .limit(1);
      const metric = await db
        .select()
        .from(periodMetrics)
        .where(eq(periodMetrics.repoId, col.repoId))
        .orderBy(desc(periodMetrics.createdAt))
        .limit(1);
      const why = await db
        .select({ reason: alternativesEdges.reason })
        .from(alternativesEdges)
        .where(eq(alternativesEdges.candidateRepoId, col.repoId))
        .limit(1);

      return {
        ...col,
        deltaStars: metric[0]?.deltaStars ?? 0,
        health: metric[0]?.health ?? "low",
        healthScore: metric[0]?.healthScore ?? 0,
        lastPush: snap[0]?.pushedAt?.toISOString() ?? "—",
        why: why[0]?.reason ?? "—",
      };
    }),
  );

  let ordered = repoData;
  if (sort === "health") {
    ordered = [...repoData].sort((a, b) => {
      const diff = b.healthScore - a.healthScore;
      if (diff !== 0) return diff;
      return b.deltaStars - a.deltaStars;
    });
  } else {
    ordered = [...repoData].sort((a, b) => b.deltaStars - a.deltaStars);
  }

  const rows = [
    {
      dimension: "Repository",
      values: ordered.map((r) => `${r.owner}/${r.name}`),
    },
    {
      dimension: "Summary",
      values: ordered.map((r) => r.description.slice(0, 80) || "—"),
    },
    {
      dimension: "Period Δ stars",
      values: ordered.map((r) => `+${r.deltaStars}`),
    },
    {
      dimension: "Health",
      values: ordered.map((r) => r.health),
    },
    {
      dimension: "License",
      values: ordered.map((r) => r.license ?? "—"),
    },
    {
      dimension: "Last push",
      values: ordered.map((r) => r.lastPush),
    },
    {
      dimension: "Why alternative",
      values: ordered.map((r) => r.why),
    },
  ];

  const response: CompareResponse = {
    repos: ordered.map((r) => ({
      owner: r.owner,
      name: r.name,
      slug: r.slug,
    })),
    rows,
    sort,
    starHistoryUrl: buildStarHistoryUrl(
      ordered.map((r) => ({ owner: r.owner, name: r.name })),
    ),
  };

  return CompareResponseSchema.parse(response);
}
