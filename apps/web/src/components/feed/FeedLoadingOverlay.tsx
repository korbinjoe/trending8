"use client";

import { FeedListSkeleton } from "@/components/feed/FeedListSkeleton";
import { useTranslations } from "next-intl";

interface FeedLoadingOverlayProps {
  minHeight?: number;
}

export function FeedLoadingOverlay({ minHeight }: FeedLoadingOverlayProps) {
  const feedT = useTranslations("feed");

  return (
    <div
      className="feed-loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={minHeight ? { minHeight } : undefined}
    >
      <div className="feed-loading-overlay__bar" aria-hidden="true" />
      <p className="feed-loading-overlay__label">{feedT("switching")}</p>
      <FeedListSkeleton count={4} label={feedT("loading")} />
    </div>
  );
}
