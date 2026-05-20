import { FeedListSkeleton } from "@/components/feed/FeedListSkeleton";
import { FeedLoadingProvider } from "@/components/feed/FeedLoadingContext";
import { FilterBar } from "@/components/feed/FilterBar";
import { HomeFeedBlock } from "@/components/home/HomeFeedBlock";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeHeroFallback } from "@/components/home/HomeHeroFallback";
import { parseFeedParams } from "@/lib/feed-params";
import { getCachedSnapshotTopicFilters } from "@/lib/topic-cache";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export const revalidate = 300;

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const feedParams = parseFeedParams(sp);
  const [topicFilters, feedT] = await Promise.all([
    getCachedSnapshotTopicFilters().catch(() => [] as string[]),
    getTranslations("feed"),
  ]);

  return (
    <FeedLoadingProvider>
      <Suspense fallback={<HomeHeroFallback />}>
        <HomeHero feedParams={feedParams} />
      </Suspense>
      <FilterBar topicFilters={topicFilters} />
      <Suspense
        fallback={
          <section className="feed-section">
            <FeedListSkeleton label={feedT("loading")} />
          </section>
        }
      >
        <HomeFeedBlock feedParams={feedParams} />
      </Suspense>
    </FeedLoadingProvider>
  );
}
