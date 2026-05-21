export interface FeedEntry {
  title: string;
  description: string;
  path: string;
}

export function getFeedDirectory(): FeedEntry[] {
  const langs = ["python", "typescript", "javascript", "rust", "go"];
  const topics = ["ai-agent", "llm", "rag"];

  return [
    {
      title: "All languages",
      description: "Top velocity repos across all languages",
      path: "/feeds/all.xml",
    },
    ...langs.map((lang) => ({
      title: `${lang} feed`,
      description: `Velocity-ranked ${lang} repositories`,
      path: `/feeds/lang/${lang}.xml`,
    })),
    ...topics.map((topic) => ({
      title: `Topic: ${topic}`,
      description: `Repositories tagged with ${topic}`,
      path: `/feeds/topic/${topic}.xml`,
    })),
  ];
}
