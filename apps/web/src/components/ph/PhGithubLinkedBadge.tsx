"use client";

import type { PhSignal } from "@github-trending/core/types";
import { githubSlugFromUrl } from "@github-trending/core/ph-signal-utils";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface PhGithubLinkedBadgeProps {
  signal: PhSignal;
  /** Repo is indexed on this site (PH + GitHub trending chart). */
  indexed?: boolean;
  repoOwner?: string;
  repoName?: string;
  className?: string;
}

export function PhGithubLinkedBadge({
  signal,
  indexed = false,
  repoOwner,
  repoName,
  className = "",
}: PhGithubLinkedBadgeProps) {
  const t = useTranslations("ph");
  const githubUrl = signal.githubUrl?.trim();
  if (!githubUrl) return null;

  const slug =
    repoOwner && repoName
      ? `${repoOwner}/${repoName}`
      : githubSlugFromUrl(githubUrl);
  const label = indexed
    ? t("githubIndexed", { slug: slug ?? githubUrl })
    : t("githubLinked", { slug: slug ?? githubUrl });

  const classNames = `badge-signal badge-signal--github-linked ${className}`.trim();

  if (indexed && repoOwner && repoName) {
    return (
      <Link
        href={`/repo/${repoOwner}/${repoName}`}
        className={classNames}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </Link>
    );
  }

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </a>
  );
}
