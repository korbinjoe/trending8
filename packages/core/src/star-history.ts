export const STAR_HISTORY_MAX_REPOS = 8;

export interface RepoSlug {
  owner: string;
  name: string;
}

export function parseRepoSlug(slug: string): RepoSlug | null {
  const trimmed = slug.trim();
  const slash = trimmed.indexOf("/");
  if (slash <= 0 || slash === trimmed.length - 1) return null;
  return {
    owner: trimmed.slice(0, slash),
    name: trimmed.slice(slash + 1),
  };
}

export function buildStarHistoryUrl(repos: RepoSlug[]): string {
  if (repos.length === 0) {
    return "https://star-history.com/";
  }
  const fragment = repos.map((r) => `${r.owner}/${r.name}`).join("&");
  return `https://star-history.com/#${fragment}`;
}

export function buildStarHistoryUrlFromSlugs(slugList: string[]): string {
  const repos = slugList
    .map(parseRepoSlug)
    .filter((r): r is RepoSlug => r !== null);
  return buildStarHistoryUrl(repos);
}
