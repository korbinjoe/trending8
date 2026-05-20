import { getCachedRepoAlternatives, getCachedRepoDetailCore } from "@/lib/cached-repo-detail";
import { RepoAlternativesPanel } from "./RepoAlternativesPanel";

interface RepoAlternativesSectionProps {
  owner: string;
  name: string;
  period?: string;
}

export async function RepoAlternativesSection({
  owner,
  name,
  period,
}: RepoAlternativesSectionProps) {
  const detail = await getCachedRepoDetailCore(owner, name, period);
  if (!detail) return null;

  const primary = {
    owner: detail.owner,
    name: detail.name,
    slug: detail.slug,
    description: detail.description,
    deltaStars: detail.deltaStars,
    health: detail.health,
    license: detail.license,
  };

  const data = await getCachedRepoAlternatives(owner, name, period);
  if (!data || data.alternatives.length === 0) return null;

  const comparePath = data.compareUrl.replace(/^https?:\/\/[^/]+/, "");

  return (
    <RepoAlternativesPanel
      primary={primary}
      alternatives={data.alternatives}
      comparePath={comparePath}
    />
  );
}
