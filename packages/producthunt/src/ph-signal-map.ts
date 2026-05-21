import type { PhSignal } from "@github-trending/core/types";
import {
  isGithubRepoUrl,
  isPhTrackingUrl,
} from "@github-trending/core/ph-signal-utils";
import type { productHuntPosts } from "@github-trending/db";
import { githubRepoCanonicalUrl } from "./github-url";

export type PhPostRow = typeof productHuntPosts.$inferSelect;

export { isPhTrackingUrl, phOutboundLinks } from "@github-trending/core/ph-signal-utils";

const DESCRIPTION_MAX = 200;

export function pickWebsiteUrl(
  row: Pick<PhPostRow, "resolvedUrl" | "websiteRedirect">,
): string | undefined {
  const candidates = [row.resolvedUrl, row.websiteRedirect].filter(
    (u): u is string => Boolean(u?.trim()),
  );
  // Product homepage: not PH tracking, not github.com (github goes in githubUrl).
  const productSite = candidates.find(
    (u) => !isPhTrackingUrl(u) && !isGithubRepoUrl(u),
  );
  if (productSite) return productSite;
  // PH /r/ website redirect when we could not resolve a real homepage.
  const phWebsite = candidates.find(
    (u) => isPhTrackingUrl(u) && u === row.websiteRedirect,
  );
  if (phWebsite) return phWebsite;
  return undefined;
}

export function pickGithubUrl(
  row: Pick<PhPostRow, "githubOwner" | "githubName">,
): string | undefined {
  if (!row.githubOwner || !row.githubName) return undefined;
  return githubRepoCanonicalUrl(row.githubOwner, row.githubName);
}

export function truncatePhDescription(
  text: string | null | undefined,
): string | undefined {
  if (!text?.trim()) return undefined;
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= DESCRIPTION_MAX) return normalized;
  return `${normalized.slice(0, DESCRIPTION_MAX).trimEnd()}…`;
}

export function buildPhSignalFromRow(row: PhPostRow): PhSignal {
  return {
    slug: row.slug,
    phUrl: row.phUrl,
    votesCount: row.votesCount,
    commentsCount: row.commentsCount,
    featuredAt: row.featuredAt?.toISOString() ?? null,
    postedAt: row.postedAt.toISOString(),
    tagline: row.tagline ?? undefined,
    description: truncatePhDescription(row.description),
    topics: row.topics.length > 0 ? row.topics : undefined,
    websiteUrl: pickWebsiteUrl(row),
    githubUrl: pickGithubUrl(row),
  };
}
