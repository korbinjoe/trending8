import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="site-footer">
      <p className="text-xs opacity-80">{t("unofficial")}</p>
      <p>{t("data")}</p>
      <p>
        {t.rich("ph", {
          phLink: (chunks) => (
            <a
              href="https://www.producthunt.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    </footer>
  );
}
