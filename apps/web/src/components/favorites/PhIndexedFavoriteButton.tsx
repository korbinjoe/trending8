"use client";

import type {
  FavoriteSnapshot,
  PhFavoriteSnapshot,
} from "@github-trending/core/types";
import { useFavorites } from "@/hooks/useFavorites";
import { usePhFavorites } from "@/hooks/usePhFavorites";
import { useTranslations } from "next-intl";

interface PhIndexedFavoriteButtonProps {
  slug: string;
  productName: string;
  phSnapshot?: PhFavoriteSnapshot;
  owner: string;
  name: string;
  repoSnapshot?: FavoriteSnapshot;
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

/** One star for PH feed rows with an indexed repo (PH launch + repository). */
export function PhIndexedFavoriteButton({
  slug,
  productName,
  phSnapshot,
  owner,
  name,
  repoSnapshot,
}: PhIndexedFavoriteButtonProps) {
  const t = useTranslations("favorites");
  const {
    isSaved: isPhSaved,
    add: addPh,
    remove: removePh,
    lastError: phError,
  } = usePhFavorites();
  const {
    isSaved: isRepoSaved,
    add: addRepo,
    remove: removeRepo,
    lastError: repoError,
  } = useFavorites();

  const phSaved = isPhSaved(slug);
  const repoSaved = isRepoSaved(owner, name);
  const saved = phSaved || repoSaved;

  const label = saved ? t("saved") : t("save");
  const ariaLabel = saved
    ? t("phIndexedAriaRemove", { name: productName, repo: `${owner}/${name}` })
    : t("phIndexedAriaSave", { name: productName, repo: `${owner}/${name}` });

  const handleClick = (e: {
    preventDefault: () => void;
    stopPropagation: () => void;
  }) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      if (phSaved) removePh(slug);
      if (repoSaved) removeRepo(owner, name);
      return;
    }
    addPh(slug, phSnapshot);
    addRepo(owner, name, repoSnapshot);
  };

  const limitReached =
    phError === "limit_reached" || repoError === "limit_reached";

  return (
    <span className="favorite-button-wrap">
      <button
        type="button"
        className={`btn-favorite${saved ? " is-saved" : ""}`}
        aria-pressed={saved}
        aria-label={ariaLabel}
        title={label}
        onClick={handleClick}
      >
        <StarIcon filled={saved} />
      </button>
      {limitReached && (
        <span className="favorite-limit-hint" role="status">
          {phError === "limit_reached" ? t("phLimitReached") : t("limitReached")}
        </span>
      )}
    </span>
  );
}
