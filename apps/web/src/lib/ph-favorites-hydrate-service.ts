import type { PhFavoriteHydrateResult } from "@github-trending/core/types";
import { getDb } from "@github-trending/db";
import { getPhLaunchBySlug } from "@github-trending/producthunt";

function normalizeSlug(slug: string): string {
  return slug.trim();
}

export async function hydratePhFavorites(
  slugs: string[],
): Promise<PhFavoriteHydrateResult[]> {
  const normalized = slugs.map(normalizeSlug).filter(Boolean);
  if (normalized.length === 0) return [];

  const db = getDb();
  return Promise.all(
    normalized.map(async (slug) => {
      const detail = await getPhLaunchBySlug(db, slug);
      if (!detail) {
        return { slug, found: false };
      }
      return {
        slug,
        found: true,
        productName: detail.productName,
        tagline: detail.signal.tagline,
        votesCount: detail.signal.votesCount,
        topics: detail.signal.topics,
      };
    }),
  );
}
