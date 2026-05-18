import type { GitHubGraphQLClient } from "./client";
import {
  DAILY_CANDIDATE_CAP_PER_LANGUAGE,
  getSearchPushedSince,
  MIN_STARS_SEARCH,
  type IngestLanguage,
} from "./config";

export interface SearchRepoNode {
  databaseId: string;
  nameWithOwner: string;
  stargazerCount: number;
  forkCount: number;
  pushedAt: string | null;
  description: string | null;
  isFork: boolean;
  primaryLanguage: { name: string } | null;
  licenseInfo: { spdxId: string } | null;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
  defaultBranchRef: {
    target: {
      history?: { totalCount: number };
    } | null;
  } | null;
}

const SEARCH_QUERY = `
query SearchRepos($q: String!, $after: String) {
  rateLimit { cost remaining resetAt }
  search(type: REPOSITORY, query: $q, first: 50, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on Repository {
        databaseId
        nameWithOwner
        stargazerCount
        forkCount
        pushedAt
        description
        isFork
        primaryLanguage { name }
        licenseInfo { spdxId }
        repositoryTopics(first: 10) {
          nodes { topic { name } }
        }
        defaultBranchRef {
          target {
            ... on Commit {
              history(since: $since) { totalCount }
            }
          }
        }
      }
    }
  }
}
`;

function buildQuery(language: IngestLanguage): string {
  const pushed = getSearchPushedSince(30);
  return `language:${language} pushed:>${pushed} stars:>=${MIN_STARS_SEARCH} fork:false archived:false`;
}

export async function searchCandidatesForLanguage(
  client: GitHubGraphQLClient,
  language: IngestLanguage,
  cap = DAILY_CANDIDATE_CAP_PER_LANGUAGE,
): Promise<SearchRepoNode[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);
  const sinceIso = since.toISOString();

  const results: SearchRepoNode[] = [];
  let after: string | null = null;
  const q = buildQuery(language);

  type SearchResult = {
    search: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      nodes: (SearchRepoNode | null)[];
    };
  };

  while (results.length < cap) {
    const response: { data: SearchResult } = await client.query<SearchResult>(
      SEARCH_QUERY,
      { q, after, since: sinceIso },
    );
    const data: SearchResult = response.data;

    const nodes = data.search.nodes.filter(
      (n: SearchRepoNode | null): n is SearchRepoNode =>
        n !== null && Boolean(n.nameWithOwner),
    );
    results.push(...nodes);

    if (!data.search.pageInfo.hasNextPage || results.length >= cap) {
      break;
    }
    after = data.search.pageInfo.endCursor;
  }

  return results.slice(0, cap);
}
