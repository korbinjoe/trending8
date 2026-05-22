"use client";

import { PhCardActions } from "@/components/feed/PhCardActions";
import { AlternativesStrip } from "@/components/feed/AlternativesStrip";
import { LICENSE_TAGS } from "@/components/feed/feed-card-constants";
import { HealthDot } from "@/components/feed/HealthDot";
import { PhBadge } from "@/components/ph/PhBadge";
import { PhGithubLinkedBadge } from "@/components/ph/PhGithubLinkedBadge";
import { usePrefetchLaunchDetail } from "@/hooks/usePrefetchLaunchDetail";
import { Link } from "@/i18n/navigation";
import { formatPhVotesMetric } from "@github-trending/core/ph-signal-utils";
import type { FeedItem, PhLaunchItem, PhProductItem } from "@github-trending/core/types";
import { useLocale, useTranslations } from "next-intl";

type PhStandaloneVariant = "launch" | "product" | "indexed";

interface PhStandaloneCardProps {
  variant: PhStandaloneVariant;
  item: PhLaunchItem | PhProductItem;
  indexedRepo?: FeedItem;
}

export function PhStandaloneCard({
  variant,
  item,
  indexedRepo,
}: PhStandaloneCardProps) {
  const launchT = useTranslations("launch");
  const phT = useTranslations("ph");
  const healthT = useTranslations("health");
  const locale = useLocale();
  const { phSignal } = item;
  const { launchDetailHref, prefetchLaunch } = usePrefetchLaunchDetail();
  const launchHref = launchDetailHref(phSignal.slug);
  const isTopRank = item.rank <= 3;
  const isIndexed = variant === "indexed" && indexedRepo != null;
  const hasGithub = Boolean(phSignal.githubUrl?.trim());
  const statusLabel =
    isIndexed || hasGithub ? null : launchT("productOnly");
  const hasAltStrip = isIndexed && (indexedRepo.alternatives.length > 0);

  const showPhDescription =
    phSignal.description &&
    phSignal.description.trim() !== (phSignal.tagline ?? "").trim();
  const showRepoDescription =
    isIndexed &&
    indexedRepo.description &&
    indexedRepo.description.trim() !== (phSignal.tagline ?? "").trim() &&
    indexedRepo.description.trim() !== (phSignal.description ?? "").trim();

  const warmLaunch = () => prefetchLaunch(phSignal.slug);

  return (
    <li className={`rank-item${hasAltStrip ? " rank-item--alt" : ""}`}>
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
                {isIndexed && (
                  <Link
                    href={`/repo/${indexedRepo.owner}/${indexedRepo.name}`}
                    className="ph-card__repo-slug"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="owner">{indexedRepo.owner}</span>
                    <span className="repo">/ {indexedRepo.name}</span>
                  </Link>
                )}
              </div>
              <div className="rank-card__stats">
                {phSignal.votesCount > 0 && (
                  <span className="delta" aria-label={phT("votes")}>
                    {formatPhVotesMetric(phSignal.votesCount, locale)}
                  </span>
                )}
                {isIndexed && indexedRepo.deltaStars > 0 && (
                  <span
                    className="delta delta--stars"
                    aria-label={`+${indexedRepo.deltaStars.toLocaleString()}`}
                  >
                    +{indexedRepo.deltaStars.toLocaleString()} ★
                  </span>
                )}
                <PhCardActions
                  signal={phSignal}
                  productName={item.name}
                  indexedRepo={isIndexed ? indexedRepo : undefined}
                />
              </div>
            </div>
            {phSignal.tagline && (
              <p className="rank-card__desc">{phSignal.tagline}</p>
            )}
            {showPhDescription && (
              <p className="rank-card__desc rank-card__desc--ph-detail">
                {phSignal.description}
              </p>
            )}
            {showRepoDescription && (
              <p className="rank-card__desc rank-card__desc--repo">
                {indexedRepo.description}
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
                  <PhGithubLinkedBadge
                    signal={phSignal}
                    indexed={isIndexed}
                    repoOwner={isIndexed ? indexedRepo.owner : undefined}
                    repoName={isIndexed ? indexedRepo.name : undefined}
                  />
                )}
                {statusLabel && (
                  <span className="badge-signal badge-signal--muted">
                    {statusLabel}
                  </span>
                )}
                {phSignal.commentsCount != null && phSignal.commentsCount > 0 && (
                  <span className="badge-signal badge-signal--muted">
                    {phT("commentsShort", {
                      count: phSignal.commentsCount.toLocaleString(locale),
                    })}
                  </span>
                )}
                {isIndexed &&
                  indexedRepo.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`tag${LICENSE_TAGS.has(tag) ? " tag--license" : ""}`}
                    >
                      {tag}
                    </span>
                  ))}
                {!isIndexed &&
                  phSignal.topics?.map((topic) => (
                    <span key={topic} className="badge-signal badge-signal--topic">
                      {topic}
                    </span>
                  ))}
              </div>
              {isIndexed && (
                <div className="rank-card__status">
                  <HealthDot
                    health={indexedRepo.health}
                    label={healthT(indexedRepo.health)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
      {hasAltStrip && (
        <AlternativesStrip
          alternatives={indexedRepo.alternatives}
          compareUrl={indexedRepo.compareUrl}
        />
      )}
    </li>
  );
}
