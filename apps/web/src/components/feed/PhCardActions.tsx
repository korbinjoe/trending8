"use client";

import type { PhSignal } from "@github-trending/core/types";
import {
  isPhTrackingUrl,
  phOutboundLinks,
} from "@github-trending/core/ph-signal-utils";
import { useTranslations } from "next-intl";

interface PhCardActionsProps {
  signal: PhSignal;
}

export function PhCardActions({ signal }: PhCardActionsProps) {
  const phT = useTranslations("ph");
  const launchT = useTranslations("launch");
  const ctaT = useTranslations("cta");
  const { github, website } = phOutboundLinks(signal);

  return (
    <div className="rank-card__actions rank-card__actions--ph">
      <a
        className="btn btn--sm"
        href={signal.phUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {phT("cta")}
      </a>
      {github && (
        <a
          className="btn btn--sm btn--ghost"
          href={github}
          target="_blank"
          rel="noopener noreferrer"
        >
          {ctaT("github")} ↗
        </a>
      )}
      {website && (
        <a
          className="btn btn--sm btn--ghost"
          href={website}
          target="_blank"
          rel="noopener noreferrer"
        >
          {isPhTrackingUrl(website)
            ? launchT("websitePhLink")
            : launchT("website")}{" "}
          ↗
        </a>
      )}
    </div>
  );
}
