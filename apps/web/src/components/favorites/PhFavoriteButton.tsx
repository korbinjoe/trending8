"use client";

import type { PhFavoriteSnapshot } from "@github-trending/core/types";
import { useTranslations } from "next-intl";
import { usePhFavorites } from "@/hooks/usePhFavorites";

interface PhFavoriteButtonProps {
  slug: string;
  productName: string;
  snapshot?: PhFavoriteSnapshot;
  variant?: "icon" | "labeled";
  className?: string;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="btn-favorite__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function PhFavoriteButton({
  slug,
  productName,
  snapshot,
  variant = "icon",
  className = "",
}: PhFavoriteButtonProps) {
  const t = useTranslations("favorites");
  const { isSaved, toggle, lastError } = usePhFavorites();
  const saved = isSaved(slug);

  const label = saved ? t("saved") : t("save");
  const ariaLabel = saved
    ? t("phAriaRemove", { name: productName })
    : t("phAriaSave", { name: productName });

  const handleClick = (e: {
    preventDefault: () => void;
    stopPropagation: () => void;
  }) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(slug, snapshot);
  };

  const showLimitHint = lastError === "limit_reached";

  return (
    <span className="favorite-button-wrap">
      <button
        type="button"
        className={`btn-favorite${saved ? " is-saved" : ""}${
          variant === "labeled" ? " btn-favorite--with-label" : ""
        } ${className}`.trim()}
        aria-pressed={saved}
        aria-label={ariaLabel}
        title={label}
        onClick={handleClick}
      >
        <StarIcon filled={saved} />
        {variant === "labeled" && <span>{label}</span>}
      </button>
      {showLimitHint && (
        <span className="favorite-limit-hint" role="status">
          {t("phLimitReached")}
        </span>
      )}
    </span>
  );
}
