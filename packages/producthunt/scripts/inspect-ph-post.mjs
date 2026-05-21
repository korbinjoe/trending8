/**
 * One-off PH API field dump for GitHub linkage debugging.
 * Usage: node scripts/inspect-ph-post.mjs [slug]
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(root, ".env") });

const PH_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql";

const POST_BY_SLUG = `
  query PostBySlug($slug: String!) {
    post(slug: $slug) {
      id
      slug
      name
      tagline
      description
      url
      website
      productLinks { type url }
      votesCount
      createdAt
      featuredAt
    }
  }
`;

const POSTS_SEARCH = `
  query PostsSearch($postedAfter: DateTime!, $first: Int!) {
    posts(first: $first, postedAfter: $postedAfter, order: VOTES) {
      edges {
        node {
          id
          slug
          name
          tagline
          description
          url
          website
          productLinks { type url }
          votesCount
          createdAt
        }
      }
    }
  }
`;

async function getToken() {
  if (process.env.PRODUCTHUNT_DEVELOPER_TOKEN) {
    return process.env.PRODUCTHUNT_DEVELOPER_TOKEN;
  }
  const key = process.env.PRODUCTHUNT_API_KEY;
  const secret = process.env.PRODUCTHUNT_API_SECRET;
  if (!key || !secret) {
    throw new Error("Missing PRODUCTHUNT_* credentials in .env");
  }
  const res = await fetch("https://api.producthunt.com/v2/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: key,
      client_secret: secret,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);
  const json = await res.json();
  return json.access_token;
}

async function gql(query, variables) {
  const token = await getToken();
  const res = await fetch(PH_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2));
  }
  return json;
}

function githubHints(obj, prefix = "") {
  const hits = [];
  const walk = (v, p) => {
    if (v == null) return;
    if (typeof v === "string") {
      if (/github/i.test(v)) hits.push({ path: p, value: v });
      return;
    }
    if (Array.isArray(v)) {
      v.forEach((item, i) => walk(item, `${p}[${i}]`));
      return;
    }
    if (typeof v === "object") {
      for (const [k, val] of Object.entries(v)) {
        walk(val, p ? `${p}.${k}` : k);
      }
    }
  };
  walk(obj, prefix);
  return hits;
}

const slug = process.argv[2] ?? "emdash";

console.log("=== post(slug) ===");
const bySlug = await gql(POST_BY_SLUG, { slug });
console.log(JSON.stringify(bySlug.data?.post ?? bySlug.data, null, 2));
if (bySlug.data?.post) {
  console.log("\n--- github-related strings in post(slug) ---");
  console.log(JSON.stringify(githubHints(bySlug.data.post), null, 2));
}

const weekAgo = new Date();
weekAgo.setUTCDate(weekAgo.getUTCDate() - 14);

console.log("\n=== recent posts matching 'emdash' in name/slug (last 14d, top 50) ===");
const recent = await gql(POSTS_SEARCH, {
  postedAfter: weekAgo.toISOString(),
  first: 50,
});
const edges = recent.data?.posts?.edges ?? [];
const matches = edges
  .map((e) => e.node)
  .filter(
    (n) =>
      /emdash/i.test(n.name) ||
      /emdash/i.test(n.slug) ||
      /emdash/i.test(n.tagline ?? "") ||
      /emdash/i.test(n.description ?? ""),
  );
console.log(JSON.stringify(matches, null, 2));
for (const m of matches) {
  console.log(`\n--- github hints for ${m.slug} ---`);
  console.log(JSON.stringify(githubHints(m), null, 2));
}

console.log("\n=== sample: first 5 recent posts productLinks ---");
for (const e of edges.slice(0, 5)) {
  const n = e.node;
  console.log({
    slug: n.slug,
    name: n.name,
    website: n.website,
    productLinks: n.productLinks,
  });
}

console.log("\n=== note: Github productLinks use PH /r/ short URLs ===");
console.log(
  "Direct parse of url fails; server redirect often blocked by Cloudflare.",
);
console.log(
  "PH supports posts(url: 'https://github.com/owner/repo') reverse lookup — used in ingest fallback.",
);
