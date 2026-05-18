import type { GitHubGraphQLClient } from "./client";
import type { SearchRepoNode } from "./search-node";

const ENRICH_BATCH_SIZE = 8;

interface EnrichRepoResult {
  defaultBranchRef: SearchRepoNode["defaultBranchRef"];
}

function buildEnrichQuery(count: number): string {
  const varDefs = ["$since: GitTimestamp!"];
  const fields: string[] = [];

  for (let i = 0; i < count; i++) {
    varDefs.push(`$owner${i}: String!`, `$name${i}: String!`);
    fields.push(`
      repo${i}: repository(owner: $owner${i}, name: $name${i}) {
        defaultBranchRef {
          target {
            ... on Commit {
              history(since: $since) { totalCount }
            }
          }
        }
      }
    `);
  }

  return `query EnrichCommits(${varDefs.join(", ")}) {\n${fields.join("\n")}\n}`;
}

function parseOwnerName(nameWithOwner: string): { owner: string; name: string } {
  const [owner, ...rest] = nameWithOwner.split("/");
  return { owner: owner ?? "", name: rest.join("/") };
}

/** Fetches 30d commit counts in small batches to avoid heavy search queries. */
export async function enrichCommits30d(
  client: GitHubGraphQLClient,
  nodes: SearchRepoNode[],
  sinceIso: string,
): Promise<void> {
  for (let i = 0; i < nodes.length; i += ENRICH_BATCH_SIZE) {
    const batch = nodes.slice(i, i + ENRICH_BATCH_SIZE);
    const query = buildEnrichQuery(batch.length);
    const variables: Record<string, string> = { since: sinceIso };

    batch.forEach((node, idx) => {
      const { owner, name } = parseOwnerName(node.nameWithOwner);
      variables[`owner${idx}`] = owner;
      variables[`name${idx}`] = name;
    });

    const { data } = await client.query<Record<string, EnrichRepoResult | null>>(
      query,
      variables,
    );

    batch.forEach((node, idx) => {
      const repo = data[`repo${idx}`];
      node.defaultBranchRef = repo?.defaultBranchRef ?? null;
    });
  }
}
