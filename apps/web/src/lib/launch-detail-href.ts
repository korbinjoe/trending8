import type { PhFeedEntry } from "@github-trending/core/types";

/** Canonical app path for a PH launch / product detail page. */
export function launchDetailHref(slug: string): `/launch/${string}` {
  return `/launch/${slug}`;
}

/** Slugs for detail prefetch from the current PH feed (capped). */
export function phFeedLaunchSlugs(entries: PhFeedEntry[], limit = 16): string[] {
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.size >= limit) break;
    if (entry.kind === "repo") {
      const slug = entry.item.phSignal?.slug;
      if (slug) slugs.add(slug);
    } else {
      slugs.add(entry.item.phSignal.slug);
    }
  }
  return [...slugs];
}
