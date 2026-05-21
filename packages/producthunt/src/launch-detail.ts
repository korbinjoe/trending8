import type { PhLaunchDetail } from "@github-trending/core/types";
import type { Database } from "@github-trending/db";
import {
  productHuntPosts,
  repositories,
  repositorySnapshots,
} from "@github-trending/db";
import { desc, eq } from "drizzle-orm";
import { classifyPhLaunchLinkage } from "./launch-linkage";
import { buildPhSignalFromRow } from "./ph-signal-map";

export async function getPhLaunchBySlug(
  db: Database,
  slug: string,
): Promise<PhLaunchDetail | null> {
  const [row] = await db
    .select()
    .from(productHuntPosts)
    .where(eq(productHuntPosts.slug, slug))
    .limit(1);

  if (!row) return null;

  const signal = buildPhSignalFromRow(row);
  const productName = row.name;
  const linkage = classifyPhLaunchLinkage(row);

  if (linkage === "indexed" && row.repoId) {
    const repoId = row.repoId;
    const [repo, snap] = await Promise.all([
      db
        .select({
          owner: repositories.owner,
          name: repositories.name,
          language: repositories.language,
        })
        .from(repositories)
        .where(eq(repositories.id, repoId))
        .limit(1),
      db
        .select({ stars: repositorySnapshots.stars })
        .from(repositorySnapshots)
        .where(eq(repositorySnapshots.repoId, repoId))
        .orderBy(desc(repositorySnapshots.capturedAt))
        .limit(1),
    ]);

    const owner = repo[0]?.owner ?? row.githubOwner ?? "";
    const name = repo[0]?.name ?? row.githubName ?? "";
    if (!owner || !name) return null;

    return {
      linkage: "indexed",
      productName,
      signal,
      repoSlug: `${owner}/${name}`,
      owner,
      name,
      language: repo[0]?.language ?? null,
      totalStars: snap[0]?.stars,
    };
  }

  if (linkage === "launch" && row.githubOwner && row.githubName) {
    return {
      linkage: "launch",
      productName,
      signal,
      githubOwner: row.githubOwner,
      githubName: row.githubName,
    };
  }

  return {
    linkage: "product",
    productName,
    signal,
  };
}
