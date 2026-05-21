"use client";

import { useRouter } from "@/i18n/navigation";
import type { PhSignal } from "@github-trending/core/types";
import { useLocale, useTranslations } from "next-intl";

function formatPhDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

interface PhBadgeProps {
  signal: PhSignal;
  /** Internal path (e.g. `/launch/my-app`). Uses span + router to avoid nested `<a>`. */
  href?: string;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  /** Called on hover/focus to warm the launch detail route. */
  onWarm?: () => void;
}

export function PhBadge({
  signal,
  href,
  className = "",
  onClick,
  onWarm,
}: PhBadgeProps) {
  const t = useTranslations("ph");
  const locale = useLocale();
  const router = useRouter();
  const dateIso = signal.featuredAt ?? signal.postedAt;
  const dateLabel = formatPhDate(dateIso, locale);
  const label = signal.featuredAt
    ? t("badgeFeatured", {
        votes: signal.votesCount.toLocaleString(locale),
        date: dateLabel,
      })
    : t("badgeLaunch", {
        votes: signal.votesCount.toLocaleString(locale),
        date: dateLabel,
      });

  const classNames = `badge-signal badge-signal--ph ${className}`.trim();

  if (href) {
    return (
      <span
        role="link"
        tabIndex={0}
        className={classNames}
        onMouseEnter={onWarm}
        onFocus={onWarm}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
          router.push(href);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            router.push(href);
          }
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <a
      href={signal.phUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {label}
    </a>
  );
}
