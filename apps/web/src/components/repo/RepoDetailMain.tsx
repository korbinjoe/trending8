import { RepoDetailView } from "@/components/repo/RepoDetailView";
import { getCachedRepoDetailCore } from "@/lib/cached-repo-detail";
import { notFound } from "next/navigation";

interface RepoDetailMainProps {
  owner: string;
  name: string;
  period?: string;
  locale: string;
}

export async function RepoDetailMain({
  owner,
  name,
  period,
  locale,
}: RepoDetailMainProps) {
  const detail = await getCachedRepoDetailCore(owner, name, period);
  if (!detail) notFound();

  return <RepoDetailView detail={detail} locale={locale} />;
}
