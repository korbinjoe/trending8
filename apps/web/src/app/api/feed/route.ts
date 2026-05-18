import { errorResponse, jsonResponse, withRateLimit } from "@/lib/api-utils";
import { getFeed } from "@/lib/feed-service";
import { getLatestRankingRunId } from "@github-trending/github";
import { getDb } from "@github-trending/db";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

async function getRankingRunTag(): Promise<string> {
  try {
    const db = getDb();
    const id = await getLatestRankingRunId(db);
    return id ?? "none";
  } catch {
    return "none";
  }
}

export async function GET(request: Request) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "velocity";
  const period = searchParams.get("period") ?? "today";

  const runTag = await getRankingRunTag();

  const cachedGetFeed = unstable_cache(
    async () =>
      getFeed({
        view,
        period,
        lang: searchParams.get("lang") ?? undefined,
        topic: searchParams.get("topic") ?? undefined,
        cursor: searchParams.get("cursor") ?? undefined,
        includeNoise: searchParams.get("includeNoise") === "true",
      }),
    ["feed", view, period, searchParams.toString(), runTag],
    { revalidate: 300, tags: [`ranking-run-${runTag}`] },
  );

  try {
    const data = await cachedGetFeed();
    return jsonResponse(data);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Feed error",
      500,
    );
  }
}
