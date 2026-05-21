import type { ParsedFeedParams } from "./feed-params";

/** Query string for `GET /api/feed` (cursor pagination, no accumulate). */
export function buildFeedApiSearchParams(
  params: Pick<
    ParsedFeedParams,
    "view" | "period" | "lang" | "topic" | "includeNoise" | "phGithub"
  >,
  cursor?: string,
): URLSearchParams {
  const q = new URLSearchParams();
  q.set("view", params.view);
  q.set("period", params.period);
  if (params.view === "ph") {
    q.set("phGithub", params.phGithub === "linked" ? "linked" : "all");
  }
  if (params.lang) q.set("lang", params.lang);
  if (params.topic) q.set("topic", params.topic);
  if (params.includeNoise) q.set("includeNoise", "true");
  if (cursor) q.set("cursor", cursor);
  return q;
}
