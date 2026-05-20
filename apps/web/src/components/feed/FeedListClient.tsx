"use client";

import { FeedListSkeleton } from "@/components/feed/FeedListSkeleton";
import { useFeedLoading } from "@/components/feed/FeedLoadingContext";
import { FeedLoadingOverlay } from "@/components/feed/FeedLoadingOverlay";
import { RankCard } from "@/components/feed/RankCard";
import { buildFeedApiSearchParams } from "@/lib/feed-api-params";
import type { ParsedFeedParams } from "@/lib/feed-params";
import {
  feedHideShellsParser,
  feedLangParser,
  feedPeriodParser,
  feedTopicParser,
  feedViewParser,
} from "@/lib/feed-query-nuqs";
import type { FeedItem, FeedResponse } from "@github-trending/core/types";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface FeedListClientProps {
  initialFeed: FeedResponse;
}

function feedParamsKey(
  params: Pick<
    ParsedFeedParams,
    "view" | "period" | "lang" | "topic" | "includeNoise"
  >,
): string {
  return [
    params.view,
    params.period,
    params.lang ?? "",
    params.topic ?? "",
    String(params.includeNoise),
  ].join("|");
}

export function FeedListClient({ initialFeed }: FeedListClientProps) {
  const emptyT = useTranslations("empty");
  const feedT = useTranslations("feed");
  const { setIsLoading: setGlobalFeedLoading } = useFeedLoading();

  const [view] = useQueryState("view", feedViewParser);
  const [period] = useQueryState("period", feedPeriodParser);
  const [lang] = useQueryState("lang", feedLangParser);
  const [topic] = useQueryState("topic", feedTopicParser);
  const [hideShells] = useQueryState("hideShells", feedHideShellsParser);

  const feedParams = useMemo(
    (): Pick<
      ParsedFeedParams,
      "view" | "period" | "lang" | "topic" | "includeNoise"
    > => ({
      view,
      period,
      lang: lang || undefined,
      topic: topic || undefined,
      includeNoise: !hideShells,
    }),
    [view, period, lang, topic, hideShells],
  );

  const feedParamsRef = useRef(feedParams);
  feedParamsRef.current = feedParams;

  const paramsKey = feedParamsKey(feedParams);
  const skipFilterFetchRef = useRef(true);
  const fetchGenRef = useRef(0);
  const pageCacheRef = useRef(new Map<string, FeedResponse>());
  const sectionRef = useRef<HTMLElement>(null);

  const [items, setItems] = useState<FeedItem[]>(initialFeed.items ?? []);
  const [cursor, setCursor] = useState<string | null>(
    initialFeed.nextCursor ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [overlayMinHeight, setOverlayMinHeight] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pageCacheRef.current.set(paramsKey, initialFeed);
  }, [paramsKey, initialFeed]);

  const loadFeed = useCallback(
    async (nextCursor?: string, options?: { fromFilter?: boolean }) => {
      const isPagination = Boolean(nextCursor);
      const key = feedParamsKey(feedParamsRef.current);
      const generation = ++fetchGenRef.current;

      setError(null);
      setGlobalFeedLoading(true);

      if (!isPagination) {
        const cached = pageCacheRef.current.get(key);
        if (options?.fromFilter && cached) {
          setItems(cached.items ?? []);
          setCursor(cached.nextCursor ?? null);
          setFilterLoading(false);
        } else if (options?.fromFilter) {
          const h = sectionRef.current?.offsetHeight;
          if (h && h > 120) setOverlayMinHeight(h);
          setFilterLoading(true);
          setItems([]);
        } else {
          setFilterLoading(false);
          setLoading(true);
          setItems([]);
        }
      } else {
        setFilterLoading(false);
        setLoading(true);
      }

      const params = buildFeedApiSearchParams(feedParamsRef.current, nextCursor);
      try {
        const res = await fetch(`/api/feed?${params}`);
        const data = (await res.json()) as FeedResponse & { error?: string };

        if (generation !== fetchGenRef.current) return;

        if (!res.ok) {
          setError(data.error ?? feedT("error"));
          if (!isPagination) setItems([]);
          setCursor(null);
          return;
        }

        const pageItems = Array.isArray(data.items) ? data.items : [];
        if (!isPagination) {
          setItems(pageItems);
          setCursor(data.nextCursor ?? null);
          pageCacheRef.current.set(key, {
            items: pageItems,
            nextCursor: data.nextCursor ?? null,
            rankingRunId: data.rankingRunId ?? null,
            updatedAt: data.updatedAt ?? null,
          });
        } else {
          setItems((prev) => [...prev, ...pageItems]);
          setCursor(data.nextCursor ?? null);
        }
      } catch {
        if (generation !== fetchGenRef.current) return;
        setError(feedT("error"));
        if (!isPagination) setItems([]);
        setCursor(null);
      } finally {
        if (generation !== fetchGenRef.current) return;
        setLoading(false);
        setFilterLoading(false);
        setOverlayMinHeight(undefined);
        setGlobalFeedLoading(false);
      }
    },
    [feedT, setGlobalFeedLoading],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("cursor")) return;
    url.searchParams.delete("cursor");
    const next =
      url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "");
    window.history.replaceState(null, "", next);
  }, []);

  useEffect(() => {
    if (skipFilterFetchRef.current) {
      skipFilterFetchRef.current = false;
      return;
    }
    void loadFeed(undefined, { fromFilter: true });
  }, [paramsKey, loadFeed]);

  if (error && items.length === 0 && !filterLoading) {
    return (
      <p className="feed-empty" role="alert">
        {error}
      </p>
    );
  }

  if (!loading && !filterLoading && items.length === 0) {
    return <p className="feed-empty">{emptyT("feed")}</p>;
  }

  return (
    <section ref={sectionRef} className="feed-section" aria-live="polite">
      {filterLoading && (
        <FeedLoadingOverlay minHeight={overlayMinHeight} />
      )}
      {!filterLoading && loading && items.length === 0 && (
        <FeedListSkeleton label={feedT("loading")} />
      )}
      {!filterLoading && items.length > 0 && (
        <ol className="rank-list">
          {items.map((item) => (
            <RankCard key={`${item.slug}-${item.rank}`} item={item} />
          ))}
        </ol>
      )}
      {error && items.length > 0 && !filterLoading && (
        <p className="feed-empty" role="alert">
          {error}
        </p>
      )}
      {cursor && !filterLoading && (
        <div className="feed-load-more">
          <button
            type="button"
            onClick={() => void loadFeed(cursor)}
            disabled={loading}
            className="btn-ghost"
            aria-busy={loading}
          >
            {loading ? feedT("loadingMore") : feedT("loadMore")}
          </button>
        </div>
      )}
    </section>
  );
}
