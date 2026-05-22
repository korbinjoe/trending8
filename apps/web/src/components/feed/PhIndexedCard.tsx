"use client";

import { PhStandaloneCard } from "@/components/feed/PhStandaloneCard";
import { RankCard } from "@/components/feed/RankCard";
import type { FeedItem } from "@github-trending/core/types";

interface PhIndexedCardProps {
  item: FeedItem;
}

/** PH feed row linked to an indexed GitHub repo — PH card body + repo metrics. */
export function PhIndexedCard({ item }: PhIndexedCardProps) {
  const phSignal = item.phSignal;
  if (!phSignal) {
    return <RankCard item={item} />;
  }

  const phItem = {
    rank: item.rank,
    name: item.phProductName ?? item.name,
    phSignal,
  };

  return (
    <PhStandaloneCard variant="indexed" item={phItem} indexedRepo={item} />
  );
}
