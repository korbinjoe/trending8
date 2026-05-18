"use client";

import { Link } from "@/i18n/navigation";
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
    <section className="hero">
      <h1>{t("title")}</h1>
      <p className="hero-meta">
        {t.rich("meta", {
          date,
          rules: (chunks) => (
            <Link href="/about#ranking">{chunks}</Link>
          ),
        })}
      </p>
      <p className="hero-meta">
        {t.rich("tzNote", {
          glossary: (chunks) => (
            <Link href="/about#signals">{chunks}</Link>
          ),
        })}
      </p>
    </section>
  );
}
