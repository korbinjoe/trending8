import type { FeedResponse } from "@github-trending/core/types";
import { unstable_cache } from "next/cache";
import type { ParsedFeedParams } from "./feed-params";
import { getFeed } from "./feed-service";

function feedCacheKey(params: ParsedFeedParams): string[] {
  return [
    "feed",
    params.view,
    params.period,
    params.lang ?? "",
    params.topic ?? "",
    params.cursor ?? "",
    String(params.includeNoise),
  ];
}

/** Cached first page / API feed (no SSR accumulate). */
export function getCachedFeed(
  params: ParsedFeedParams,
): Promise<FeedResponse> {
  return unstable_cache(
    () =>
      getFeed({
        view: params.view,
        period: params.period,
        lang: params.lang,
        topic: params.topic,
        cursor: params.cursor,
        includeNoise: params.includeNoise,
      }),
    feedCacheKey(params),
    { revalidate: 300, tags: ["feed"] },
  )();
}
