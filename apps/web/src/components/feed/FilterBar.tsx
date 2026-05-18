"use client";

import { useTranslations } from "next-intl";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";

const PERIODS = ["today", "week", "month", "halfYear", "year"] as const;
const VIEWS = ["velocity", "early"] as const;
const LANGUAGES = [
  "",
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Go",
] as const;

export function FilterBar() {
  const t = useTranslations("filter");
  const tabT = useTranslations("tab");

  const [view, setView] = useQueryState(
    "view",
    parseAsStringEnum([...VIEWS]).withDefault("velocity"),
  );
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringEnum([...PERIODS]).withDefault("today"),
  );
  const [lang, setLang] = useQueryState("lang", parseAsString.withDefault(""));

  return (
    <section className="filters space-y-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              view === v
                ? "bg-accent/15 border-accent text-accent"
                : "border-border text-muted hover:text-text"
            }`}
          >
            {v === "velocity" ? tabT("velocity") : tabT("early")}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">
        {view === "velocity" ? tabT("hintVelocity") : tabT("hintEarly")}
      </p>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{t("language")}</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value || null)}
            className="bg-surface border border-border rounded-lg px-3 py-2"
          >
            <option value="">{t("allLanguages")}</option>
            {LANGUAGES.filter(Boolean).map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{t("period")}</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as (typeof PERIODS)[number])}
            className="bg-surface border border-border rounded-lg px-3 py-2"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {t(p === "halfYear" ? "halfYear" : p)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
