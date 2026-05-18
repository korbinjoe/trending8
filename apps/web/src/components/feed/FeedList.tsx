"use client";

import type { FeedItem, FeedResponse } from "@github-trending/core/types";
import { useTranslations } from "next-intl";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { RankCard } from "./RankCard";

export function FeedList() {
  const t = useTranslations("empty");
  const [view] = useQueryState("view", parseAsStringEnum(["velocity", "early"]).withDefault("velocity"));
  const [period] = useQueryState("period", parseAsStringEnum(["today", "week", "month", "halfYear", "year"]).withDefault("today"));
  const [lang] = useQueryState("lang", parseAsString.withDefault(""));
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (nextCursor?: string) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ view, period });
    if (lang) params.set("lang", lang);
    if (nextCursor) params.set("cursor", nextCursor);

    try {
      const res = await fetch(`/api/feed?${params}`);
      const data = (await res.json()) as FeedResponse & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to load feed");
        if (!nextCursor) setItems([]);
        return;
      }

      const pageItems = Array.isArray(data.items) ? data.items : [];
      setItems((prev) => (nextCursor ? [...prev, ...pageItems] : pageItems));
      setCursor(data.nextCursor ?? null);
      setUpdatedAt(data.updatedAt ?? null);
    } catch {
      setError("Failed to load feed");
      if (!nextCursor) setItems([]);
    } finally {
      setLoading(false);
    }
  }, [view, period, lang]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  if (!loading && error) {
    return <p className="text-danger text-center py-12 text-sm">{error}</p>;
  }

  if (!loading && items.length === 0) {
    return <p className="text-muted text-center py-12">{t("feed")}</p>;
  }

  return (
    <section>
      {items.map((item) => (
        <RankCard key={`${item.slug}-${item.rank}`} item={item} />
      ))}
      {cursor && (
        <button
          type="button"
          onClick={() => loadFeed(cursor)}
          disabled={loading}
          className="w-full py-3 text-sm text-accent border border-border rounded-lg hover:bg-surface-hover"
        >
          Load more
        </button>
      )}
      <span className="sr-only" data-updated={updatedAt ?? ""} />
    </section>
  );
}
