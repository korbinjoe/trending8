import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defaultPhIngestLogger } from "./ingest";
import { runPhHistoryBackfill } from "./backfill-history";

dotenv.config({
  path: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../.env",
  ),
});

function parseIntFlag(flag: string): number | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || !process.argv[idx + 1]) return undefined;
  const n = Number.parseInt(process.argv[idx + 1] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const force = process.argv.includes("--force");

runPhHistoryBackfill({
  logger: defaultPhIngestLogger,
  force,
  lookbackDays: parseIntFlag("--lookback-days"),
  chunkDays: parseIntFlag("--chunk-days"),
  maxPages: parseIntFlag("--max-pages"),
  requestDelayMs: parseIntFlag("--delay-ms"),
})
  .then((r) => {
    console.log("PH history backfill complete", r);
    if (!r.skipped) {
      console.log(
        "Tip: trigger /api/cron/ph-ingest (or redeploy) to revalidate ph-feed cache on Vercel.",
      );
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
