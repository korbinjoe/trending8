"use client";

import { PhStandaloneCard } from "@/components/feed/PhStandaloneCard";
import type { PhLaunchItem } from "@github-trending/core/types";

interface PhLaunchCardProps {
  item: PhLaunchItem;
}

export function PhLaunchCard({ item }: PhLaunchCardProps) {
  return <PhStandaloneCard variant="launch" item={item} />;
}
