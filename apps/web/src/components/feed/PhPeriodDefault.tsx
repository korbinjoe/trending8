"use client";

import { defaultFeedPeriod } from "@/lib/feed-params";
import { feedViewParser } from "@/lib/feed-query-nuqs";
import { useEffectiveFeedPeriod } from "@/lib/use-effective-feed-period";
import { useQueryState } from "nuqs";
import { useEffect, useRef } from "react";

/** Writes default `period` into the URL when missing (PH → week, GitHub → today). */
export function PhPeriodDefault() {
  const [view] = useQueryState("view", feedViewParser);
  const { period, setPeriod } = useEffectiveFeedPeriod();
  const normalized = useRef(false);

  useEffect(() => {
    if (normalized.current) return;

    const url = new URL(window.location.href);
    if (url.searchParams.has("period")) return;

    normalized.current = true;
    const target = defaultFeedPeriod(view);
    void setPeriod(target);
  }, [view, period, setPeriod]);

  return null;
}
