import { getSiteUrl } from "./site";

export interface FeedEntry {
  title: string;
  description: string;
  path: string;
}

export function getFeedDirectory(): FeedEntry[] {
  const base = getSiteUrl();
  const langs = ["python", "typescript", "javascript", "rust", "go"];
  const topics = ["ai-agent", "llm", "rag"];

  return [
    {
      title: "All languages",
      description: "Top velocity repos across all languages",
      path: `${base}/feeds/all.xml`,
    },
    ...langs.map((lang) => ({
      title: `${lang} feed`,
      description: `Velocity-ranked ${lang} repositories`,
      path: `${base}/feeds/lang/${lang}.xml`,
    })),
    ...topics.map((topic) => ({
      title: `Topic: ${topic}`,
      description: `Repositories tagged with ${topic}`,
      path: `${base}/feeds/topic/${topic}.xml`,
    })),
  ];
}
