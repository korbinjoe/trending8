"use client";

import { PhCardActions } from "@/components/feed/PhCardActions";
import { PhBadge } from "@/components/ph/PhBadge";
import { PhGithubLinkedBadge } from "@/components/ph/PhGithubLinkedBadge";
import { usePrefetchLaunchDetail } from "@/hooks/usePrefetchLaunchDetail";
import { Link } from "@/i18n/navigation";
import type { PhLaunchItem, PhProductItem } from "@github-trending/core/types";
import { useLocale, useTranslations } from "next-intl";

type PhStandaloneVariant = "launch" | "product";

interface PhStandaloneCardProps {
  variant: PhStandaloneVariant;
  item: PhLaunchItem | PhProductItem;
}

export function PhStandaloneCard({ variant, item }: PhStandaloneCardProps) {
  const launchT = useTranslations("launch");
  const phT = useTranslations("ph");
  const locale = useLocale();
  const { phSignal } = item;
  const { launchDetailHref, prefetchLaunch } = usePrefetchLaunchDetail();
  const launchHref = launchDetailHref(phSignal.slug);
  const isTopRank = item.rank <= 3;
  const hasGithub = Boolean(phSignal.githubUrl?.trim());
  const statusLabel = hasGithub ? null : launchT("productOnly");

  const showDescription =
    phSignal.description &&
    phSignal.description.trim() !== (phSignal.tagline ?? "").trim();

  const statsParts = [`PH ${phSignal.votesCount.toLocaleString(locale)}↑`];
  if (phSignal.commentsCount && phSignal.commentsCount > 0) {
    statsParts.push(
      phT("commentsShort", {
        count: phSignal.commentsCount.toLocaleString(locale),
      }),
    );
  }

  const warmLaunch = () => prefetchLaunch(phSignal.slug);

  return (
    <li className="rank-item">
      <article
        className={`rank-card ph-standalone-card ph-standalone-card--${variant}`}
      >
        <Link
          href={launchHref}
          prefetch
          className="rank-card__cover"
          aria-label={item.name}
          onMouseEnter={warmLaunch}
          onFocus={warmLaunch}
        />
        <div className="rank-card__layout">
          <div className="rank-card__content">
            <div className="rank-card__top">
              <span
                className={`rank-card__rank${isTopRank ? " rank-card__rank--top" : ""}`}
              >
                {item.rank}
              </span>
              <div className="rank-card__title">
                <span className="owner rank-card__title-text">{item.name}</span>
              </div>
              <div className="rank-card__stats">
                <span className="delta">{statsParts.join(" · ")}</span>
              </div>
            </div>
            {phSignal.tagline && (
              <p className="rank-card__desc">{phSignal.tagline}</p>
            )}
            {showDescription && (
              <p className="rank-card__desc rank-card__desc--ph-detail">
                {phSignal.description}
              </p>
            )}
            <div className="rank-card__bottom">
              <div className="rank-card__chips">
                <PhBadge
                  signal={phSignal}
                  href={launchHref}
                  onWarm={warmLaunch}
                />
                {hasGithub && (
                  <PhGithubLinkedBadge signal={phSignal} indexed={false} />
                )}
                {statusLabel && (
                  <span className="badge-signal badge-signal--muted">
                    {statusLabel}
                  </span>
                )}
                {phSignal.topics?.map((topic) => (
                  <span key={topic} className="badge-signal badge-signal--topic">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <PhCardActions signal={phSignal} />
        </div>
      </article>
    </li>
  );
}
