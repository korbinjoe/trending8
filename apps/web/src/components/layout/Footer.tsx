"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="site-footer">
      <p>{t("data")}</p>
    </footer>
  );
}
