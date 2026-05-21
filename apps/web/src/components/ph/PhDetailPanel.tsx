import type { PhSignal } from "@github-trending/core/types";
import { phOutboundLinks } from "@github-trending/core/ph-signal-utils";
import { getLocale, getTranslations } from "next-intl/server";

interface PhDetailPanelProps {
  signal: PhSignal;
}

function formatFullDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export async function PhDetailPanel({ signal }: PhDetailPanelProps) {
  const t = await getTranslations("ph");
  const launchT = await getTranslations("launch");
  const ctaT = await getTranslations("cta");
  const locale = await getLocale();
  const { github, website } = phOutboundLinks(signal);

  return (
    <section className="panel panel--ph" aria-labelledby="ph-panel-heading">
      <div className="ph-panel__head">
        <h2 className="ph-panel__title" id="ph-panel-heading">
          <span className="ph-mark" aria-hidden="true">
            P
          </span>
          {t("panelTitle")}
        </h2>
        <a
          className="btn btn--primary"
          href={signal.phUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("cta")} ↗
        </a>
      </div>
      {signal.tagline && <p className="ph-panel__tagline">{signal.tagline}</p>}
      {signal.description &&
        signal.description.trim() !== (signal.tagline ?? "").trim() && (
          <p className="ph-panel__description">{signal.description}</p>
        )}
      <div className="ph-panel__stats">
        <span>
          {t("votes")} <strong>{signal.votesCount.toLocaleString(locale)}</strong>
        </span>
        {signal.commentsCount != null && signal.commentsCount > 0 && (
          <span>
            {t("commentsShort", {
              count: signal.commentsCount.toLocaleString(locale),
            })}
          </span>
        )}
        {signal.featuredAt && (
          <span>
            {t("featured")}{" "}
            <strong>{formatFullDate(signal.featuredAt, locale)}</strong>
          </span>
        )}
        <span>
          {t("posted")}{" "}
          <strong>{formatFullDate(signal.postedAt, locale)}</strong>
        </span>
      </div>
      {signal.topics && signal.topics.length > 0 && (
        <div className="ph-panel__topics">
          {signal.topics.map((topic) => (
            <span key={topic} className="badge-signal badge-signal--topic">
              {topic}
            </span>
          ))}
        </div>
      )}
      {(github || website) && (
        <div className="ph-panel__links">
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
              {launchT("website")} ↗
            </a>
          )}
        </div>
      )}
      <p className="ph-attribution">{t("panelAttribution")}</p>
    </section>
  );
}
