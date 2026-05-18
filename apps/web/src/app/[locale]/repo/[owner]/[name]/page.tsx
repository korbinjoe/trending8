import { HealthDot } from "@/components/feed/HealthDot";
import { getRepoDetail } from "@/lib/repo-service";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 600;

export default async function RepoPage({
  params,
}: {
  params: Promise<{ locale: string; owner: string; name: string }>;
}) {
  const { locale, owner, name } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const detail = await getRepoDetail(owner, name);
  if (!detail) notFound();

  return (
    <article className="py-6">
      <Link href="/" className="text-sm text-muted hover:text-accent">
        ← {t("repo.back")}
      </Link>
      <h1 className="text-2xl font-bold mt-4 font-mono">
        {detail.owner}/{detail.name}
      </h1>
      <p className="text-muted mt-2">{detail.description}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <Stat label={t("repo.statDelta")} value={`+${detail.deltaStars}`} accent />
        <Stat label={t("repo.statTotal")} value={String(detail.totalStars)} />
        <Stat label={t("repo.statCommits")} value={String(detail.commits30d)} />
        <Stat label={t("repo.statPush")} value={detail.lastPush?.slice(0, 10) ?? "—"} />
      </div>
      <div className="mt-4">
        <HealthDot health={detail.health} label={t(`health.${detail.health}`)} />
      </div>
      <div className="flex flex-wrap gap-3 mt-8">
        <a
          href={detail.urls.github}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-accent text-bg rounded-lg text-sm font-medium"
        >
          GitHub ↗
        </a>
        <a
          href={detail.urls.starHistory}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-border rounded-lg text-sm"
        >
          star-history ↗
        </a>
        <a
          href={detail.urls.ossInsight}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-border rounded-lg text-sm"
        >
          OSS Insight ↗
        </a>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-xl font-mono mt-1 ${accent ? "text-accent" : ""}`}>
        {value}
      </p>
    </div>
  );
}
