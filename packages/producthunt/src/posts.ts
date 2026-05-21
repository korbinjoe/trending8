import { phGraphql } from "./client";

export interface PhTopicNode {
  slug: string;
  name: string;
}

export interface PhProductLinkNode {
  type: string;
  url: string;
}

export interface PhPostNode {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  url: string;
  website: string | null;
  productLinks: PhProductLinkNode[];
  votesCount: number;
  commentsCount: number;
  featuredAt: string | null;
  createdAt: string;
  topics: PhTopicNode[];
}

interface PostsQueryData {
  posts: {
    edges: Array<{ node: PhPostApiNode }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface PhPostApiNode {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  url: string;
  website: string | null;
  productLinks: Array<{ type: string; url: string }>;
  votesCount: number;
  commentsCount: number;
  featuredAt: string | null;
  createdAt: string;
  topics: { edges: Array<{ node: { slug: string; name: string } }> };
}

export type PhPostsOrder = "VOTES" | "NEWEST" | "RANKING" | "FEATURED_AT";

const RECENT_POSTS_QUERY = `
  query PhRecentPosts(
    $postedAfter: DateTime!
    $postedBefore: DateTime
    $topic: String
    $first: Int!
    $after: String
    $order: PostsOrder
  ) {
    posts(
      first: $first
      postedAfter: $postedAfter
      postedBefore: $postedBefore
      topic: $topic
      order: $order
      after: $after
    ) {
      edges {
        node {
          id
          slug
          name
          tagline
          description
          url
          website
          productLinks {
            type
            url
          }
          votesCount
          commentsCount
          featuredAt
          createdAt
          topics(first: 5) {
            edges {
              node {
                slug
                name
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const POSTS_BY_URL_QUERY = `
  query PhPostsByUrl($url: String!) {
    posts(url: $url, first: 1) {
      edges {
        node {
          id
          slug
          name
          tagline
          description
          url
          website
          productLinks {
            type
            url
          }
          votesCount
          commentsCount
          featuredAt
          createdAt
          topics(first: 5) {
            edges {
              node {
                slug
                name
              }
            }
          }
        }
      }
    }
  }
`;

function mapNode(node: PhPostApiNode): PhPostNode {
  return {
    id: node.id,
    slug: node.slug,
    name: node.name,
    tagline: node.tagline,
    description: node.description,
    url: node.url,
    website: node.website,
    productLinks: node.productLinks ?? [],
    votesCount: node.votesCount,
    commentsCount: node.commentsCount,
    featuredAt: node.featuredAt,
    createdAt: node.createdAt,
    topics: node.topics.edges.map((e) => e.node),
  };
}

export interface FetchRecentPostsParams {
  postedAfter: string;
  postedBefore?: string;
  topic?: string;
  first: number;
  after?: string | null;
  order?: PhPostsOrder;
}

export async function fetchRecentPosts(
  params: FetchRecentPostsParams,
  logger?: { warn: (msg: string, meta?: Record<string, unknown>) => void },
): Promise<{ posts: PhPostNode[]; nextCursor: string | null }> {
  const data = await phGraphql<PostsQueryData>(
    RECENT_POSTS_QUERY,
    {
      postedAfter: params.postedAfter,
      postedBefore: params.postedBefore ?? null,
      topic: params.topic ?? null,
      first: params.first,
      after: params.after ?? null,
      order: params.order ?? "VOTES",
    },
    logger,
  );

  const posts = data.posts.edges.map((e) => mapNode(e.node));
  return {
    posts,
    nextCursor: data.posts.pageInfo.hasNextPage
      ? data.posts.pageInfo.endCursor
      : null,
  };
}

export interface FetchAllRecentPostsOptions {
  maxPages?: number;
  delayMs?: number;
}

export async function fetchAllRecentPosts(
  params: Omit<FetchRecentPostsParams, "after">,
  logger?: { warn: (msg: string, meta?: Record<string, unknown>) => void },
  options?: FetchAllRecentPostsOptions,
): Promise<PhPostNode[]> {
  const maxPages = options?.maxPages ?? 10;
  const delayMs = options?.delayMs ?? 0;
  const all: PhPostNode[] = [];
  let after: string | null = null;

  for (let page = 0; page < maxPages; page++) {
    const batch = await fetchRecentPosts({ ...params, after }, logger);
    all.push(...batch.posts);
    if (!batch.nextCursor) break;
    after = batch.nextCursor;
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return all;
}

export async function fetchPostByGithubUrl(
  githubUrl: string,
  logger?: { warn: (msg: string, meta?: Record<string, unknown>) => void },
): Promise<PhPostNode | null> {
  const data = await phGraphql<{ posts: { edges: Array<{ node: PhPostApiNode }> } }>(
    POSTS_BY_URL_QUERY,
    { url: githubUrl },
    logger,
  );
  const node = data.posts.edges[0]?.node;
  return node ? mapNode(node) : null;
}
