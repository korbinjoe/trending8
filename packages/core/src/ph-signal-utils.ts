import type { PhSignal } from "./types";

const PH_TRACKING_RE = /producthunt\.com\/r\//i;
const GITHUB_SLUG_RE = /github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i;

export function isPhTrackingUrl(url: string): boolean {
  return PH_TRACKING_RE.test(url);
}

/** True when URL points at a github.com repo (not a product homepage). */
export function isGithubRepoUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.replace(/^www\./, "");
    return host === "github.com";
  } catch {
    return false;
  }
}

export function githubSlugFromUrl(url: string): string | null {
  const match = url.match(GITHUB_SLUG_RE);
  if (!match?.[1] || !match[2]) return null;
  return `${match[1]}/${match[2]}`;
}

/** Client-safe: dedupe outbound link buttons on PH cards. */
export function phOutboundLinks(signal: PhSignal): {
  github?: string;
  website?: string;
} {
  const github = signal.githubUrl?.trim();
  let website = signal.websiteUrl?.trim();
  if (website && github && website === github) {
    website = undefined;
  }
  if (website && website === signal.phUrl) {
    website = undefined;
  }
  return {
    github: github || undefined,
    website: website || undefined,
  };
}

/** PH upvote metric styled like feed star velocity (+1,234 ↑). */
export function formatPhVotesMetric(
  votes: number,
  locale = "en",
): string {
  return `+${votes.toLocaleString(locale)} ↑`;
}
