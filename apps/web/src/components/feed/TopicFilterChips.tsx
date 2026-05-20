"use client";

import { useFeedLoading } from "@/components/feed/FeedLoadingContext";
import { useTranslations } from "next-intl";
import { feedTopicParser } from "@/lib/feed-query-nuqs";
import { useQueryState } from "nuqs";
import { useMemo } from "react";

interface TopicFilterChipsProps {
  topicFilters: string[];
}

export function TopicFilterChips({ topicFilters }: TopicFilterChipsProps) {
  const t = useTranslations("filter");
  const { isLoading: feedLoading } = useFeedLoading();
  const [topic, setTopic] = useQueryState("topic", feedTopicParser);

  const chips = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const value of topicFilters) {
      if (!seen.has(value)) {
        seen.add(value);
        ordered.push(value);
      }
    }
    if (topic && !seen.has(topic)) {
      ordered.push(topic);
    }
    return ordered;
  }, [topicFilters, topic]);

  return (
    <section
      className={`topics${feedLoading ? " topics--loading" : ""}`}
      role="group"
      aria-label={t("topicsGroup")}
      aria-busy={feedLoading}
    >
      <button
        type="button"
        className={`chip ${topic === "" ? "is-on" : ""}`}
        disabled={feedLoading}
        onClick={() => setTopic(null)}
      >
        {t("topicAll")}
      </button>
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          className={`chip ${topic === chip ? "is-on" : ""}`}
          disabled={feedLoading}
          onClick={() => setTopic(chip)}
        >
          {chip}
        </button>
      ))}
    </section>
  );
}
