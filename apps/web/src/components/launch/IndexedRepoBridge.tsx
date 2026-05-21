import type { PhLaunchDetail } from "@github-trending/core/types";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

interface IndexedRepoBridgeProps {
  detail: Extract<PhLaunchDetail, { linkage: "indexed" }>;
}

export async function IndexedRepoBridge({ detail }: IndexedRepoBridgeProps) {
  const t = await getTranslations("launch");
  const locale = await getLocale();
  const repoHref = `/repo/${detail.owner}/${detail.name}?from=ph`;

  return (
    <section className="panel panel--bridge" aria-labelledby="indexed-bridge-heading">
      <h2 className="panel__title" id="indexed-bridge-heading">
        {t("indexedBridgeTitle")}
      </h2>
      <p className="panel__body">{t("indexedBridgeBody")}</p>
      <dl className="launch-bridge__meta">
        <div>
          <dt>{t("indexedRepoLabel")}</dt>
          <dd>
            <code>{detail.repoSlug}</code>
          </dd>
        </div>
        {detail.language && (
          <div>
            <dt>{t("indexedLanguageLabel")}</dt>
            <dd>{detail.language}</dd>
          </div>
        )}
        {detail.totalStars != null && (
          <div>
            <dt>{t("indexedStarsLabel")}</dt>
            <dd>{detail.totalStars.toLocaleString(locale)}</dd>
          </div>
        )}
      </dl>
      <Link href={repoHref} className="btn btn--primary">
        {t("viewTrendingDetail")} →
      </Link>
    </section>
  );
}
