import type { PhLaunchDetail } from "@github-trending/core/types";
import { githubRepoUrl } from "@/lib/site";
import { getTranslations } from "next-intl/server";

interface GithubSlugBlockProps {
  detail: Extract<PhLaunchDetail, { linkage: "launch" }>;
}

export async function GithubSlugBlock({ detail }: GithubSlugBlockProps) {
  const t = await getTranslations("launch");
  const ctaT = await getTranslations("cta");
  const slug = `${detail.githubOwner}/${detail.githubName}`;
  const githubHref = githubRepoUrl(detail.githubOwner, detail.githubName);

  return (
    <section className="panel" aria-labelledby="github-slug-heading">
      <h2 className="panel__title" id="github-slug-heading">
        {t("githubSlugTitle")}
      </h2>
      <p className="panel__body">
        <code>{slug}</code>
      </p>
      <a
        className="btn btn--primary"
        href={githubHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ctaT("github")} ↗
      </a>
    </section>
  );
}
