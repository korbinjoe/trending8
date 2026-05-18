import { getDb } from "@github-trending/db";
import type { FeedPeriod } from "@github-trending/core/types";
import { GitHubGraphQLClient, GitHubRateLimitError } from "./client";
import { INGEST_LANGUAGES } from "./config";
import { computeAlternativesForPeriod } from "./alternatives";
import { runRankingBatch } from "./ranking-batch";
import { searchCandidatesForLanguage } from "./search";
import { logIngestError, upsertRepositorySnapshot } from "./snapshot-writer";

export interface IngestResult {
  reposIngested: number;
  errors: number;
  rankingRunIds: string[];
}

export interface IngestLogger {
  info: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
}

const defaultLogger: IngestLogger = {
  info: (msg, meta) => console.log(msg, meta ?? ""),
  error: (msg, meta) => console.error(msg, meta ?? ""),
};

export async function runIngest(
  options?: { ranking?: boolean; logger?: IngestLogger },
): Promise<IngestResult> {
  const logger = options?.logger ?? defaultLogger;
  const db = getDb();
  const client = new GitHubGraphQLClient();

  let reposIngested = 0;
  let errors = 0;
  const rankingRunIds: string[] = [];

  logger.info("ingest_start", { languages: INGEST_LANGUAGES });

  for (const language of INGEST_LANGUAGES) {
    try {
      const nodes = await searchCandidatesForLanguage(client, language);
      for (const node of nodes) {
        try {
          await upsertRepositorySnapshot(db, node);
          reposIngested += 1;
        } catch (err) {
          errors += 1;
          const [owner, name] = node.nameWithOwner.split("/");
          await logIngestError(
            db,
            owner ?? null,
            name ?? null,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
    } catch (err) {
      if (err instanceof GitHubRateLimitError) {
        logger.error("rate_limit", { resetAt: err.resetAt, language });
        errors += 1;
        continue;
      }
      throw err;
    }
  }

  if (options?.ranking) {
    const periods: FeedPeriod[] = ["today", "week"];
    const views = ["velocity", "early"] as const;
    for (const period of periods) {
      for (const view of views) {
        const result = await runRankingBatch(db, period, view);
        rankingRunIds.push(result.rankingRunId);
        await computeAlternativesForPeriod(db, period, result.rankingRunId);
      }
    }
  }

  logger.info("ingest_complete", { reposIngested, errors, rankingRunIds });

  return { reposIngested, errors, rankingRunIds };
}
