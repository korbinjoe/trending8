import type { Database } from "@github-trending/db";
import { getDb, productHuntPosts } from "@github-trending/db";
import { sql } from "drizzle-orm";
import { hasProductHuntCredentials } from "./auth";
import { buildPhBackfillWindows } from "./backfill-windows";
import {
  getBackfillChunkDays,
  getBackfillLookbackDays,
  getBackfillMaxPages,
  getBackfillRequestDelayMs,
  getIngestTopics,
  getPageSize,
} from "./config";
import { ProductHuntRateLimitError } from "./errors";
import type { PhIngestLogger } from "./ingest";
import { defaultPhIngestLogger } from "./ingest";
import { processPhPosts } from "./ingest-batch";
import { fetchAllRecentPosts } from "./posts";

const DEFAULT_RATE_LIMIT_WAIT_MS = 60_000;

export interface PhHistoryBackfillOptions {
  logger?: PhIngestLogger;
  db?: Database;
  lookbackDays?: number;
  chunkDays?: number;
  maxPages?: number;
  requestDelayMs?: number;
  force?: boolean;
  topics?: string[];
}

export interface PhHistoryBackfillResult {
  skipped: boolean;
  skipReason?: string;
  lookbackDays: number;
  windowsProcessed: number;
  postsFetched: number;
  postsUpserted: number;
  linkedCount: number;
  errors: number;
}

export async function getPhPostCoverageDays(
  db: Database,
): Promise<number | null> {
  const [row] = await db
    .select({ oldest: sql<string | null>`min(${productHuntPosts.postedAt})` })
    .from(productHuntPosts);
  if (!row?.oldest) return null;

  const oldest = new Date(row.oldest);
  if (Number.isNaN(oldest.getTime())) return null;

  const ms = Date.now() - oldest.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function rateLimitWaitMs(resetAt: string | null): number {
  if (!resetAt) return DEFAULT_RATE_LIMIT_WAIT_MS;
  const reset = new Date(resetAt).getTime();
  if (Number.isNaN(reset)) return DEFAULT_RATE_LIMIT_WAIT_MS;
  return Math.max(5_000, reset - Date.now() + 1_000);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchWindowPosts(
  params: {
    postedAfter: string;
    postedBefore: string;
    topic?: string;
    first: number;
  },
  logger: PhIngestLogger,
  maxPages: number,
  delayMs: number,
): Promise<{ posts: Awaited<ReturnType<typeof fetchAllRecentPosts>>; rateLimitWaits: number }> {
  let rateLimitWaits = 0;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const posts = await fetchAllRecentPosts(
        {
          ...params,
          order: "NEWEST",
        },
        logger,
        { maxPages, delayMs },
      );
      return { posts, rateLimitWaits };
    } catch (err) {
      if (err instanceof ProductHuntRateLimitError) {
        rateLimitWaits += 1;
        const wait = rateLimitWaitMs(err.resetAt);
        logger.warn("ph_backfill_rate_limited", { waitMs: wait, attempt });
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }

  throw new ProductHuntRateLimitError(
    "Product Hunt rate limit exceeded after retries",
    null,
  );
}

export async function runPhHistoryBackfill(
  options?: PhHistoryBackfillOptions,
): Promise<PhHistoryBackfillResult> {
  const logger = options?.logger ?? defaultPhIngestLogger;
  const db = options?.db ?? getDb();
  const lookbackDays = options?.lookbackDays ?? getBackfillLookbackDays();
  const chunkDays = options?.chunkDays ?? getBackfillChunkDays();
  const maxPages = options?.maxPages ?? getBackfillMaxPages();
  const requestDelayMs = options?.requestDelayMs ?? getBackfillRequestDelayMs();
  const pageSize = getPageSize();
  const topics = options?.topics ?? getIngestTopics();
  const topicBatches = topics.length > 0 ? topics : [undefined];

  const empty: PhHistoryBackfillResult = {
    skipped: true,
    lookbackDays,
    windowsProcessed: 0,
    postsFetched: 0,
    postsUpserted: 0,
    linkedCount: 0,
    errors: 0,
  };

  if (!hasProductHuntCredentials()) {
    logger.info("ph_backfill_skipped", { reason: "no_credentials" });
    return { ...empty, skipReason: "no_credentials" };
  }

  if (!options?.force) {
    const coverage = await getPhPostCoverageDays(db);
    if (coverage !== null && coverage >= lookbackDays - 2) {
      logger.info("ph_backfill_skipped", {
        reason: "coverage_sufficient",
        coverageDays: coverage,
        lookbackDays,
      });
      return {
        ...empty,
        skipReason: "coverage_sufficient",
      };
    }
  }

  const windows = buildPhBackfillWindows(lookbackDays, chunkDays);
  let postsFetched = 0;
  let postsUpserted = 0;
  let linkedCount = 0;
  let errors = 0;
  let windowsProcessed = 0;

  logger.info("ph_backfill_start", {
    lookbackDays,
    chunkDays,
    windows: windows.length,
    topics: topicBatches.length,
    maxPages,
    requestDelayMs,
  });

  for (const window of windows) {
    for (const topic of topicBatches) {
      try {
        const { posts } = await fetchWindowPosts(
          {
            postedAfter: window.postedAfter.toISOString(),
            postedBefore: window.postedBefore.toISOString(),
            topic,
            first: pageSize,
          },
          logger,
          maxPages,
          requestDelayMs,
        );

        postsFetched += posts.length;
        logger.info("ph_backfill_window_fetched", {
          topic: topic ?? "all",
          postedAfter: window.postedAfter.toISOString(),
          postedBefore: window.postedBefore.toISOString(),
          count: posts.length,
        });

        const batch = await processPhPosts(db, posts, logger);
        postsUpserted += batch.postsUpserted;
        linkedCount += batch.linkedCount;
        errors += batch.errors;
        windowsProcessed += 1;
      } catch (err) {
        errors += 1;
        const msg = err instanceof Error ? err.message : String(err);
        logger.error("ph_backfill_window_failed", {
          topic: topic ?? "all",
          postedAfter: window.postedAfter.toISOString(),
          postedBefore: window.postedBefore.toISOString(),
          reason: msg,
        });
      }

      if (requestDelayMs > 0) {
        await sleep(requestDelayMs);
      }
    }
  }

  logger.info("ph_backfill_complete", {
    lookbackDays,
    windowsProcessed,
    postsFetched,
    postsUpserted,
    linkedCount,
    errors,
  });

  return {
    skipped: false,
    lookbackDays,
    windowsProcessed,
    postsFetched,
    postsUpserted,
    linkedCount,
    errors,
  };
}
