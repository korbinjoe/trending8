"use client";

import { FeedList } from "@/components/feed/FeedList";
import { FilterBar } from "@/components/feed/FilterBar";
import { Hero } from "@/components/layout/Hero";
import { Suspense, useState } from "react";

export function HomeFeed() {
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  return (
    <>
      <Hero updatedAt={updatedAt} />
      <Suspense fallback={null}>
        <FilterBar />
        <FeedList onUpdatedAt={setUpdatedAt} />
      </Suspense>
    </>
  );
}
