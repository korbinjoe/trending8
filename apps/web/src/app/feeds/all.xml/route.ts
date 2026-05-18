import { buildRssFeed, RSS_CACHE_HEADERS } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const xml = await buildRssFeed();
  return new Response(xml, { headers: RSS_CACHE_HEADERS });
}
