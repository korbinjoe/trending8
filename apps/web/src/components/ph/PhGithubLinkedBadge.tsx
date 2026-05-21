"use client";

import type { PhSignal } from "@github-trending/core/types";
import { githubSlugFromUrl } from "@github-trending/core/ph-signal-utils";
import { useTranslations } from "next-intl";

interface PhGithubLinkedBadgeProps {
  signal: PhSignal;
  /** Repo is indexed on this site (PH + GitHub trending chart). */
  indexed?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

export function PhGithubLinkedBadge({
  signal,
  indexed = false,
  className = "",
  onClick,
}: PhGithubLinkedBadgeProps) {
  const t = useTranslations("ph");
  const githubUrl = signal.githubUrl?.trim();
  if (!githubUrl) return null;

  const slug = githubSlugFromUrl(githubUrl);
  const label = indexed
    ? t("githubIndexed", { slug: slug ?? githubUrl })
    : t("githubLinked", { slug: slug ?? githubUrl });

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`badge-signal badge-signal--github-linked ${className}`.trim()}
      onClick={onClick}
    >
      {label}
    </a>
  );
}
