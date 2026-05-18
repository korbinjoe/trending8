"use client";

import { ChartModal } from "@/components/chart/ChartModal";
import { Link } from "@/i18n/navigation";
import type { FeedItem } from "@github-trending/core/types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AlternativesStrip } from "./AlternativesStrip";
import { HealthDot } from "./HealthDot";

const LICENSE_TAGS = new Set([
  "MIT",
  "Apache-2.0",
  "GPL-3.0",
  "BSD-3-Clause",
  "ISC",
]);

interface RankCardProps {
  item: FeedItem;
}

function signalBadgeClass(trigger: string): string {
  if (/hn/i.test(trigger)) return "badge-signal badge-signal--hn";
  if (/shell/i.test(trigger)) return "badge-signal badge-signal--shell";
  return "badge-signal badge-signal--trigger";
}

export function RankCard({ item }: RankCardProps) {
  const t = useTranslations();
  const tabT = useTranslations("tab");
  const [chartOpen, setChartOpen] = useState(false);
  const healthLabel = t(`health.${item.health}`);
  const hasAltStrip = item.alternatives.length > 0;

  return (
    <li className={hasAltStrip ? "rank-item" : undefined}>
      <Link href={`/repo/${item.owner}/${item.name}`} className="rank-card">
        <span className="rank-card__rank">{item.rank}</span>
        <div className="rank-card__body">
          <div className="rank-card__title">
            <span className="owner">{item.owner}</span>
            <span className="repo">/ {item.name}</span>
            {item.isEarlySignal && (
              <span className="badge-early">{tabT("early")}</span>
            )}
          </div>
          {item.triggers && item.triggers.length > 0 && (
            <div className="signal-row">
              {item.triggers.map((trigger) => (
                <span key={trigger} className={signalBadgeClass(trigger)}>
                  {trigger}
                </span>
              ))}
            </div>
          )}
          {item.description && (
            <p className="rank-card__desc">{item.description}</p>
          )}
          {item.tags.length > 0 && (
            <div className="tag-list">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className={`tag${LICENSE_TAGS.has(tag) ? " tag--license" : ""}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="rank-card__meta">
          <span className="delta">
            +{item.deltaStars.toLocaleString()} ★
          </span>
          <HealthDot health={item.health} label={healthLabel} />
          <button
            type="button"
            className="btn-ghost chart-trigger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setChartOpen(true);
            }}
          >
            {t("cta.chart")}
          </button>
        </div>
      </Link>
      {hasAltStrip && (
        <AlternativesStrip
          alternatives={item.alternatives}
          compareUrl={item.compareUrl}
        />
      )}
      <ChartModal
        owner={item.owner}
        name={item.name}
        open={chartOpen}
        onClose={() => setChartOpen(false)}
      />
    </li>
  );
}
