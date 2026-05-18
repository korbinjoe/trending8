import { FeedList } from "@/components/feed/FeedList";
import { FilterBar } from "@/components/feed/FilterBar";
import { Hero } from "@/components/layout/Hero";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <FilterBar />
        <FeedList />
      </Suspense>
    </>
  );
}
