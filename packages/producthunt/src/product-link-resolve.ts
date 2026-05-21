import {
  extractGithubFromProductLinks,
  extractGithubFromText,
  githubRepoCanonicalUrl,
  type GithubRepoSlug,
  type PhProductLink,
} from "./github-url";
import {
  resolveGithubFromWebsite,
  resolveGithubFromWebsiteHtml,
  resolveWebsiteUrl,
} from "./redirect";

function isGithubLinkType(type: string): boolean {
  return /github/i.test(type);
}

function isWebsiteLinkType(type: string): boolean {
  return /website/i.test(type);
}

function isPhTrackingUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "producthunt.com" && /\/r\//i.test(url);
  } catch {
    return false;
  }
}

export function hasGithubProductLink(
  links: PhProductLink[] | null | undefined,
): boolean {
  return links?.some((l) => isGithubLinkType(l.type)) ?? false;
}

export async function resolveGithubFromProductLinks(
  links: PhProductLink[] | null | undefined,
): Promise<{ slug: GithubRepoSlug; url: string } | null> {
  const direct = extractGithubFromProductLinks(links);
  if (direct) return direct;

  if (!links?.length) return null;

  const githubTyped = links.filter((l) => isGithubLinkType(l.type));
  for (const link of githubTyped) {
    const resolved = await resolveGithubFromWebsite(link.url);
    if (resolved) {
      return {
        slug: { owner: resolved.owner, name: resolved.name },
        url: resolved.url,
      };
    }
  }

  const websiteTyped = links.filter((l) => isWebsiteLinkType(l.type));
  for (const link of websiteTyped) {
    const final = await resolveWebsiteUrl(link.url);
    if (!final || isPhTrackingUrl(final)) continue;

    const directFinal = extractGithubFromText(final);
    if (directFinal) {
      return {
        slug: directFinal,
        url: githubRepoCanonicalUrl(directFinal.owner, directFinal.name),
      };
    }

    const fromHtml = await resolveGithubFromWebsiteHtml(final);
    if (fromHtml) return fromHtml;
  }

  return null;
}
