import { RepoDetailView } from "@/components/repo/RepoDetailView";
import { getRepoDetail } from "@/lib/repo-service";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const revalidate = 600;

export default async function RepoPage({
  params,
}: {
  params: Promise<{ locale: string; owner: string; name: string }>;
}) {
  const { locale, owner, name } = await params;
  setRequestLocale(locale);
  const detail = await getRepoDetail(owner, name);
  if (!detail) notFound();

  return <RepoDetailView detail={detail} locale={locale} />;
}
