import { buildRssFeed, RSS_CACHE_HEADERS } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const TOPIC_FEEDS = ["ai-agent", "llm", "rag"] as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ topic: string }> },
) {
  const { topic } = await context.params;
  const topicName = topic.replace(/\.xml$/, "");

  if (!TOPIC_FEEDS.includes(topicName as (typeof TOPIC_FEEDS)[number])) {
    return new Response("Feed not found", { status: 404 });
  }

  const xml = await buildRssFeed({ topic: topicName });
  return new Response(xml, { headers: RSS_CACHE_HEADERS });
}
