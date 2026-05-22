"use client";

import { formatPhVotesMetric } from "@github-trending/core/ph-signal-utils";
import type {
  PhFavoriteHydrateResult,
  PhFavoriteItem,
} from "@github-trending/core/types";
import { Link } from "@/i18n/navigation";
import { usePhFavorites } from "@/hooks/usePhFavorites";
import { hydratePhFavoritesClient } from "@/lib/ph-favorites-hydrate";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { PhFavoriteButton } from "./PhFavoriteButton";

function formatSavedAt(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function hydrateKey(slug: string): string {
  return slug.toLowerCase();
}

interface RowDisplay {
  item: PhFavoriteItem;
  hydrate?: PhFavoriteHydrateResult;
}

export function PhFavoritesList({ locale }: { locale: string }) {
  const t = useTranslations("favorites");
  const phT = useTranslations("ph");
  const { items, hydrated, remove, clearAll, count } = usePhFavorites();
  const [hydrateMap, setHydrateMap] = useState<Map<string, PhFavoriteHydrateResult>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);
  const [hydrateWarning, setHydrateWarning] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!hydrated || items.length === 0) {
      setHydrateMap(new Map());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setHydrateWarning(false);

    hydratePhFavoritesClient(items.map((item) => item.slug))
      .then((results) => {
        if (cancelled) return;
        const map = new Map<string, PhFavoriteHydrateResult>();
        for (const row of results) {
          map.set(hydrateKey(row.slug), row);
        }
        setHydrateMap(map);
      })
      .catch(() => {
        if (!cancelled) setHydrateWarning(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items, hydrated]);

  const rows: RowDisplay[] = useMemo(
    () =>
      items.map((item) => ({
        item,
        hydrate: hydrateMap.get(hydrateKey(item.slug)),
      })),
    [items, hydrateMap],
  );

  if (!hydrated || count === 0) {
    return null;
  }

  return (
    <section className="favorites-section favorites-section--ph">
      <header className="favorites-section__head">
        <h2 className="favorites-section__title">{t("phSectionTitle")}</h2>
        <p className="favorites-count">{t("phCount", { n: count })}</p>
      </header>

      <div className="favorites-toolbar favorites-toolbar--section">
        <div className="favorites-actions-bar">
          {!confirmClear ? (
            <button
              type="button"
              className="btn-text-danger"
              onClick={() => setConfirmClear(true)}
            >
              {t("phClearAll")}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-text-danger"
                onClick={() => {
                  clearAll();
                  setConfirmClear(false);
                }}
              >
                {t("confirmClear")}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setConfirmClear(false)}
              >
                {t("cancelClear")}
              </button>
            </>
          )}
        </div>
      </div>

      {hydrateWarning && (
        <p className="favorites-warning" role="status">
          {t("phHydrateWarning")}
        </p>
      )}

      <ul className="favorites-list" aria-label={t("phListLabel")}>
        {loading &&
          Array.from({ length: Math.min(3, count) }).map((_, i) => (
            <li key={`ph-sk-${i}`}>
              <article className="fav-item fav-item--skeleton">
                <div className="fav-item__main">
                  <p className="fav-item__title">&nbsp;</p>
                  <p className="fav-item__desc">&nbsp;</p>
                  <p className="fav-item__meta">&nbsp;</p>
                </div>
              </article>
            </li>
          ))}

        {!loading &&
          rows.map(({ item, hydrate }) => {
            const found = hydrate?.found === true;
            const name =
              (found ? hydrate?.productName : item.snapshot?.productName) ??
              item.slug;
            const tagline =
              (found ? hydrate?.tagline : item.snapshot?.tagline) ?? "";
            const votes =
              (found ? hydrate?.votesCount : item.snapshot?.votesCount) ?? null;
            const topics = found ? hydrate?.topics : undefined;
            const notIndexed = hydrate && !hydrate.found;

            return (
              <li key={item.slug}>
                <article
                  className={`fav-item fav-item--ph${
                    notIndexed ? " fav-item--not-indexed" : ""
                  }`}
                >
                  <div className="fav-item__main">
                    <div className="fav-item__title">
                      <Link href={`/launch/${item.slug}`}>
                        <span className="owner">{name}</span>
                      </Link>
                      <span className="fav-item__saved">
                        {t("savedAt", {
                          date: formatSavedAt(item.savedAt, locale),
                        })}
                      </span>
                      {notIndexed && (
                        <span className="badge-not-indexed">{t("phNotFound")}</span>
                      )}
                    </div>
                    {tagline ? (
                      <p className="fav-item__desc">{tagline}</p>
                    ) : notIndexed ? (
                      <p className="fav-item__desc">{t("phNotFoundHint")}</p>
                    ) : null}
                    <div className="fav-item__meta">
                      {votes != null && votes > 0 && (
                        <span className="delta" aria-label={phT("votes")}>
                          {formatPhVotesMetric(votes, locale)}
                        </span>
                      )}
                      {topics?.slice(0, 3).map((topic) => (
                        <span key={topic} className="tag">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="fav-item__aside">
                    <PhFavoriteButton
                      slug={item.slug}
                      productName={name}
                      snapshot={item.snapshot}
                    />
                    <button
                      type="button"
                      className="fav-item__remove"
                      onClick={() => remove(item.slug)}
                    >
                      {t("remove")}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
