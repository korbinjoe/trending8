import { buildRssFeed, RSS_CACHE_HEADERS } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(
  _request: Request,
  context: { params: Promise<{ lang: string }> },
) {
  const { lang } = await context.params;
  const language = lang.replace(/\.xml$/, "");
  const xml = await buildRssFeed({ language });
  return new Response(xml, { headers: RSS_CACHE_HEADERS });
}
