import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function LaunchNotFound() {
  const t = await getTranslations("launch");

  return (
    <section className="panel launch-not-found">
      <h1 className="launch-detail__title">{t("notFoundTitle")}</h1>
      <p className="panel__body">{t("notFoundBody")}</p>
      <Link href="/?view=ph&period=week" className="btn btn--primary">
        {t("notFoundCta")}
      </Link>
    </section>
  );
}
