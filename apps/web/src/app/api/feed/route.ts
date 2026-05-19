import { errorResponse, jsonResponse, withRateLimit } from "@/lib/api-utils";
import { getFeed } from "@/lib/feed-service";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

export async function GET(request: Request) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "velocity";
  const period = searchParams.get("period") ?? "today";
  const lang = searchParams.get("lang") ?? undefined;
  const topic = searchParams.get("topic") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const includeNoise = searchParams.get("includeNoise") === "true";

  const cachedGetFeed = unstable_cache(
    async () =>
      getFeed({ view, period, lang, topic, cursor, includeNoise }),
    ["feed", view, period, lang ?? "", topic ?? "", cursor ?? "", String(includeNoise)],
    { revalidate: 300, tags: ["feed"] },
  );

  try {
    const data = await cachedGetFeed();
    const tag = data.rankingRunId ?? "none";
    return jsonResponse(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Ranking-Run-Id": tag,
      },
    });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Feed error",
      500,
    );
  }
}
