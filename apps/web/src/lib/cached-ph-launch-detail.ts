import type { PhLaunchDetail } from "@github-trending/core/types";
import { getPhLaunchBySlug } from "@github-trending/producthunt";
import { getDb } from "@github-trending/db";
import { unstable_cache } from "next/cache";
import { cache } from "react";

async function loadPhLaunchDetail(slug: string): Promise<PhLaunchDetail | null> {
  return unstable_cache(
    async () => {
      const db = getDb();
      return getPhLaunchBySlug(db, slug);
    },
    ["ph-launch", slug],
    { revalidate: 300, tags: ["ph-launch", `ph-launch:${slug}`] },
  )();
}

/** Cached launch detail; deduped per request (metadata + page). */
export const getCachedPhLaunchDetail = cache((slug: string) =>
  loadPhLaunchDetail(slug),
);
