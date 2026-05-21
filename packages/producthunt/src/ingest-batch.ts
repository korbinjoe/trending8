import type { Database } from "@github-trending/db";
import { ingestErrors } from "@github-trending/db";
import { MAX_REDIRECT_RESOLVES_PER_BATCH } from "./config";
import type { PhIngestLogger } from "./ingest";
import { resolvePostGithubLink, upsertProductHuntPost } from "./linking";
import { hasGithubProductLink } from "./product-link-resolve";
import type { PhPostNode } from "./posts";

async function logPhError(
  db: Database,
  message: string,
  slug?: string,
): Promise<void> {
  const [owner, name] = slug?.split("/") ?? [null, null];
  await db.insert(ingestErrors).values({
    owner: owner ?? null,
    name: name ?? null,
    message,
    source: "producthunt",
  });
}

export interface ProcessPhPostsResult {
  postsUpserted: number;
  linkedCount: number;
  errors: number;
  redirectResolves: number;
}

export async function processPhPosts(
  db: Database,
  posts: PhPostNode[],
  logger: PhIngestLogger,
  options?: { maxRedirectResolves?: number },
): Promise<ProcessPhPostsResult> {
  const maxRedirects =
    options?.maxRedirectResolves ?? MAX_REDIRECT_RESOLVES_PER_BATCH;

  let postsUpserted = 0;
  let linkedCount = 0;
  let errors = 0;
  let redirectResolves = 0;

  for (const post of posts) {
    try {
      const needsRedirectResolve =
        Boolean(post.website) || hasGithubProductLink(post.productLinks);
      const skipRedirect =
        needsRedirectResolve && redirectResolves >= maxRedirects;
      const link = await resolvePostGithubLink(db, post, {
        skipRedirect,
        logger,
      });

      if (needsRedirectResolve && !skipRedirect) {
        redirectResolves += 1;
      }

      await upsertProductHuntPost(db, post, link);
      postsUpserted += 1;
      if (link.repoId) linkedCount += 1;
    } catch (err) {
      errors += 1;
      const msg = err instanceof Error ? err.message : String(err);
      await logPhError(db, msg, post.slug);
      logger.error("ph_post_failed", { slug: post.slug, reason: msg });
    }
  }

  return { postsUpserted, linkedCount, errors, redirectResolves };
}
