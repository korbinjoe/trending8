import { getTranslations } from "next-intl/server";

export async function NotIndexedBanner() {
  const t = await getTranslations("launch");

  return (
    <section
      className="panel panel--warn"
      role="note"
      aria-labelledby="not-indexed-heading"
    >
      <h2 className="panel__title" id="not-indexed-heading">
        {t("notIndexedTitle")}
      </h2>
      <p className="panel__body">{t("notIndexedBody")}</p>
    </section>
  );
}
