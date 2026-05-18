"use client";

import type { CompareResponse } from "@github-trending/core/types";
import { useTranslations } from "next-intl";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { CompareMatrix } from "./CompareMatrix";

export function CompareClient() {
  const t = useTranslations("compare");
  const cta = useTranslations("cta");
  const [repos] = useQueryState("repos", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum(["health", "velocity"]).withDefault("health"),
  );
  const [data, setData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repos) return;
    const params = new URLSearchParams({ repos, sort });
    fetch(`/api/compare?${params}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? "Compare failed");
        }
        return res.json() as Promise<CompareResponse>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [repos, sort]);

  if (!repos) {
    return <p className="text-muted">Add ?repos=owner/name,owner2/name2 to compare.</p>;
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSort("health")}
          className={`px-3 py-1 rounded border text-sm ${sort === "health" ? "border-accent text-accent" : "border-border text-muted"}`}
        >
          {t("sortHealth")}
        </button>
        <button
          type="button"
          onClick={() => setSort("velocity")}
          className={`px-3 py-1 rounded border text-sm ${sort === "velocity" ? "border-accent text-accent" : "border-border text-muted"}`}
        >
          {t("sortVelocity")}
        </button>
      </div>
      <CompareMatrix data={data} />
      <div className="flex gap-3 mt-6">
        <a
          href={data.starHistoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent border border-accent/40 px-3 py-2 rounded-lg"
        >
          {cta("openCharts")} ↗
        </a>
      </div>
    </div>
  );
}
