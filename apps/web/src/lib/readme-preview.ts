const PREVIEW_MAX_CHARS = 1200;
const PREVIEW_MAX_PARAGRAPHS = 2;

interface GitHubReadmeResponse {
  content?: string;
  encoding?: string;
}

/** Strip common Markdown for a plain-text excerpt. */
export function extractReadmePreviewParagraphs(
  markdown: string,
  maxChars = PREVIEW_MAX_CHARS,
  maxParagraphs = PREVIEW_MAX_PARAGRAPHS,
): string[] {
  let text = markdown.replace(/\r\n/g, "\n");
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/!\[[^\]]*]\([^)]+\)/g, "");
  text = text.replace(/\[([^\]]+)]\([^)]+\)/g, "$1");
  text = text.replace(/^#{1,6}\s+.*$/gm, "");
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, maxParagraphs);

  if (paragraphs.length === 0) return [];

  let total = 0;
  const result: string[] = [];
  for (const para of paragraphs) {
    const remaining = maxChars - total;
    if (remaining <= 0) break;
    if (para.length <= remaining) {
      result.push(para);
      total += para.length;
      continue;
    }
    result.push(`${para.slice(0, remaining).trim()}…`);
    break;
  }
  return result;
}

export async function fetchRepoReadmeMarkdown(
  owner: string,
  name: string,
): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/readme`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const body = (await res.json()) as GitHubReadmeResponse;
  if (body.encoding !== "base64" || !body.content) return null;

  return Buffer.from(body.content, "base64").toString("utf-8");
}

export async function getRepoReadmePreviewParagraphs(
  owner: string,
  name: string,
): Promise<string[] | null> {
  const markdown = await fetchRepoReadmeMarkdown(owner, name);
  if (!markdown) return null;
  const paragraphs = extractReadmePreviewParagraphs(markdown);
  return paragraphs.length > 0 ? paragraphs : null;
}
