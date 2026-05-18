"use client";

import type { FeedItem } from "@github-trending/core/types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { ChartModal } from "@/components/chart/ChartModal";
import { AlternativesStrip } from "./AlternativesStrip";
import { HealthDot } from "./HealthDot";

interface RankCardProps {
  item: FeedItem;
}

export function RankCard({ item }: RankCardProps) {
  const t = useTranslations();
  const [chartOpen, setChartOpen] = useState(false);
  const healthLabel = t(`health.${item.health}`);

  return (
    <>
      <article
        className="rank-card block bg-surface border border-border rounded-[10px] p-4 mb-3 hover:bg-surface-hover transition-colors cursor-pointer"
        onClick={() => {
          window.location.href = `/repo/${item.owner}/${item.name}`;
        }}
      >
        <div className="flex gap-3 items-start">
          <span className="text-muted font-mono text-sm w-8 shrink-0">
            #{item.rank}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base truncate">
              {item.owner}/{item.name}
            </h2>
            <p className="text-sm text-muted line-clamp-2 mt-1">
              {item.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-accent font-mono text-sm">
                +{item.deltaStars}
              </span>
              <HealthDot health={item.health} label={healthLabel} />
              {item.isEarlySignal && (
                <span className="text-xs text-warn border border-warn/40 px-1.5 rounded">
                  Early
                </span>
              )}
            </div>
            <AlternativesStrip
              alternatives={item.alternatives}
              compareUrl={item.compareUrl}
            />
            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="chart-trigger text-xs border border-border px-2.5 py-1 rounded hover:border-accent text-muted hover:text-accent"
                onClick={() => setChartOpen(true)}
              >
                {t("cta.chart")}
              </button>
              {item.compareUrl && (
                <Link
                  href={item.compareUrl.replace(/^https?:\/\/[^/]+/, "")}
                  className="text-xs border border-border px-2.5 py-1 rounded hover:border-accent text-muted hover:text-accent"
                >
                  {t("cta.compare")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
      <ChartModal
        owner={item.owner}
        name={item.name}
        open={chartOpen}
        onClose={() => setChartOpen(false)}
      />
    </>
  );
}
