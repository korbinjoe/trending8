import { RepoDetailView } from "@/components/repo/RepoDetailView";
import { getCachedRepoReadmePreview } from "@/lib/cached-github-readme";
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
  const [detail, readmePreview] = await Promise.all([
    getCachedRepoDetailCore(owner, name, period),
    getCachedRepoReadmePreview(owner, name),
  ]);
  if (!detail) notFound();

  return (
    <RepoDetailView
      detail={detail}
      locale={locale}
      readmePreview={readmePreview}
    />
  );
}
