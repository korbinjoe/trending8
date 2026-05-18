"use client";

import { useTranslations } from "next-intl";

interface HeroProps {
  updatedAt?: string | null;
}

export function Hero({ updatedAt }: HeroProps) {
  const t = useTranslations("hero");
  const date = updatedAt
    ? new Date(updatedAt).toISOString().slice(0, 16).replace("T", " ")
    : "—";

  return (
    <section className="py-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
        {t("title")}
      </h1>
      <p className="text-sm text-muted">{t("meta", { date })}</p>
    </section>
  );
}
