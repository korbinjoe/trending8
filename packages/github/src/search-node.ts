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
