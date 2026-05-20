import { Hero } from "@/components/layout/Hero";
import type { ParsedFeedParams } from "@/lib/feed-params";
import { getCachedLatestCompletedRun } from "@/lib/ranking-run-cache";
import { toIsoString } from "@/lib/timestamp";

interface HomeHeroProps {
  feedParams: Pick<ParsedFeedParams, "view" | "period">;
}

export async function HomeHero({ feedParams }: HomeHeroProps) {
  const run = await getCachedLatestCompletedRun(
    feedParams.period,
    feedParams.view,
  );
  const updatedAt = toIsoString(run?.completedAt);

  return <Hero updatedAt={updatedAt} />;
}
