import {
  githubRepoCanonicalUrl,
  normalizeGithubSlug,
  type GithubRepoSlug,
} from "./github-url";
import { fetchPostByGithubUrl } from "./posts";

const GITHUB_SEARCH_URL = "https://api.github.com/search/repositories";
const SEARCH_PER_PAGE = 5;

export async function searchGithubReposByName(
  name: string,
): Promise<GithubRepoSlug[]> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const params = new URLSearchParams({
    q: `${name} in:name`,
    sort: "stars",
    order: "desc",
    per_page: String(SEARCH_PER_PAGE),
  });

  const res = await fetch(`${GITHUB_SEARCH_URL}?${params}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "github-trending-plus/1.0",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { items?: Array<{ full_name: string }> };
  const slugs: GithubRepoSlug[] = [];

  for (const item of data.items ?? []) {
    const [owner, repo] = item.full_name.split("/");
    if (owner && repo) {
      slugs.push(normalizeGithubSlug(owner, repo));
    }
  }

  return slugs;
}

/** Match GitHub repo via PH `posts(url:)` when redirects are blocked (e.g. Cloudflare). */
export async function resolveGithubViaPhReverseLookup(
  postSlug: string,
  searchName: string,
  logger?: { warn: (msg: string, meta?: Record<string, unknown>) => void },
): Promise<{ slug: GithubRepoSlug; url: string } | null> {
  const candidates = await searchGithubReposByName(searchName);

  for (const slug of candidates) {
    const url = githubRepoCanonicalUrl(slug.owner, slug.name);
    const post = await fetchPostByGithubUrl(url, logger);
    if (post?.slug === postSlug) {
      return { slug, url };
    }
  }

  return null;
}
