"use client";

import { buildStarHistoryUrlFromSlugs } from "@github-trending/core";
import type { RepoAlternativeDetail, RepoDetail } from "@github-trending/core/types";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";

interface RepoAlternativesPanelProps {
  primary: Pick<
    RepoDetail,
    "owner" | "name" | "slug" | "description" | "deltaStars" | "health" | "license"
  >;
  alternatives: RepoAlternativeDetail[];
  comparePath: string;
}

type AltRow = {
  slug: string;
  owner: string;
  name: string;
  description: string;
  deltaStars: number;
  health: RepoAlternativeDetail["health"];
  license: string | null;
  why?: string;
  isPrimary: boolean;
};

function healthDotClass(health: RepoAlternativeDetail["health"]): string {
  if (health === "fair") return "dot dot--warn";
  if (health === "low") return "dot dot--bad";
  return "dot";
}

function AltListItem({
  row,
  checked,
  onToggle,
}: {
  row: AltRow;
  checked: boolean;
  onToggle: (slug: string, checked: boolean) => void;
}) {
  const t = useTranslations();

  return (
    <li className="alt-list__item">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(row.slug, e.target.checked)}
          data-repo={row.slug}
        />
        <div className="alt-list__main">
          <div className="alt-list__head">
            <span className="alt-list__name">
              {row.owner} / {row.name}
            </span>
            {row.isPrimary && (
              <span className="alt-list__badge">{t("repo.alt.primary")}</span>
            )}
          </div>
          <p className="alt-list__summary">{row.description}</p>
          <div className="alt-list__meta">
            <span className="health">
              <span className={healthDotClass(row.health)} aria-hidden="true" />
              <span>{t(`health.${row.health}`)}</span>
            </span>
            {row.license && <span className="tag tag--license">{row.license}</span>}
            <span>+{row.deltaStars} ★</span>
            {row.why && <span className="alt-list__why">{row.why}</span>}
          </div>
        </div>
      </label>
    </li>
  );
}

export function RepoAlternativesPanel({
  primary,
  alternatives,
  comparePath,
}: RepoAlternativesPanelProps) {
  const t = useTranslations();
  const allSlugs = useMemo(
    () => [primary.slug, ...alternatives.map((a) => a.slug)],
    [primary.slug, alternatives],
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allSlugs));

  const rows: AltRow[] = [
    {
      slug: primary.slug,
      owner: primary.owner,
      name: primary.name,
      description: primary.description,
      deltaStars: primary.deltaStars,
      health: primary.health,
      license: primary.license,
      isPrimary: true,
    },
    ...alternatives.map((a) => ({ ...a, isPrimary: false })),
  ];

  if (rows.length <= 1) return null;

  const selectedList = allSlugs.filter((s) => selected.has(s));
  const compareHref =
    selectedList.length > 1
      ? `/compare?repos=${selectedList.join(",")}`
      : comparePath.replace(/^https?:\/\/[^/]+/, "");
  const chartHref = buildStarHistoryUrlFromSlugs(selectedList);

  function toggle(slug: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }

  return (
    <section className="panel" aria-labelledby="alt-heading">
      <h2 className="panel__title" id="alt-heading">
        {t("repo.alt.title")}
      </h2>
      <p className="panel__subtitle">{t("repo.alt.intro")}</p>
      <ul className="alt-list">
        {rows.map((row) => (
          <AltListItem
            key={row.slug}
            row={row}
            checked={selected.has(row.slug)}
            onToggle={toggle}
          />
        ))}
      </ul>
      <div className="cta-row">
        <Link href={compareHref} className="btn btn--primary">
          {t("repo.alt.openCompare")}
        </Link>
        <a className="btn" href={chartHref} target="_blank" rel="noopener noreferrer">
          {t("repo.similar.compare")}
        </a>
      </div>
    </section>
  );
}
