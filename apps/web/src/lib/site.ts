export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function repoUrl(owner: string, name: string): string {
  return `${getSiteUrl()}/repo/${owner}/${name}`;
}

export function compareUrl(slugs: string[]): string {
  const params = new URLSearchParams({ repos: slugs.join(",") });
  return `${getSiteUrl()}/compare?${params.toString()}`;
}

export function githubRepoUrl(owner: string, name: string): string {
  return `https://github.com/${owner}/${name}`;
}

export function ossInsightUrl(owner: string, name: string): string {
  return `https://ossinsight.io/analyze/${owner}/${name}`;
}

export function librariesIoUrl(owner: string, name: string): string {
  return `https://libraries.io/github/${owner}/${name}`;
}
