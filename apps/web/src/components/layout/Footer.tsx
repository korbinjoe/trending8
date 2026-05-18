"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="mt-12 pt-6 border-t border-border text-sm text-muted text-center">
      <p>{t("data")}</p>
    </footer>
  );
}
