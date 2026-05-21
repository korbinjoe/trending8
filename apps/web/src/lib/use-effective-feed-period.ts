"use client";

import { parseFeedPeriod } from "@/lib/feed-params";
import type { FeedPeriod, FeedView } from "@github-trending/core/types";
import { useQueryState } from "nuqs";
import { feedPeriodParser, feedViewParser } from "./feed-query-nuqs";

export function useEffectiveFeedPeriod(): {
  view: FeedView;
  period: FeedPeriod;
  setPeriod: (value: FeedPeriod | null) => void;
} {
  const [view] = useQueryState("view", feedViewParser);
  const [periodRaw, setPeriod] = useQueryState("period", feedPeriodParser);
  const period = parseFeedPeriod(periodRaw ?? undefined, view);
  return { view, period, setPeriod };
}
