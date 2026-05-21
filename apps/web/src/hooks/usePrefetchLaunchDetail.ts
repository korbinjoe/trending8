"use client";

import { launchDetailHref } from "@/lib/launch-detail-href";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useRef } from "react";

/** Prefetch `/launch/[slug]` RSC payload once per slug per session. */
export function usePrefetchLaunchDetail() {
  const router = useRouter();
  const seen = useRef(new Set<string>());

  const prefetchLaunch = useCallback(
    (slug: string) => {
      const key = slug.trim();
      if (!key || seen.current.has(key)) return;
      seen.current.add(key);
      router.prefetch(launchDetailHref(key));
    },
    [router],
  );

  return { launchDetailHref, prefetchLaunch };
}
