"use client";

import { PhStandaloneCard } from "@/components/feed/PhStandaloneCard";
import type { PhProductItem } from "@github-trending/core/types";

interface PhProductCardProps {
  item: PhProductItem;
}

export function PhProductCard({ item }: PhProductCardProps) {
  return <PhStandaloneCard variant="product" item={item} />;
}
