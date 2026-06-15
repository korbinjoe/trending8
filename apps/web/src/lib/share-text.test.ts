import { describe, expect, it } from "vitest";
import { buildTop8Tweet } from "./share-text";

const SAMPLE = [
  { owner: "vercel", name: "next.js", description: "The React Framework", deltaStars: 2400 },
  { owner: "facebook", name: "react", description: "The library for web", deltaStars: 1800 },
  { owner: "langchain-ai", name: "langchain", description: "Build apps with LLMs", deltaStars: 1200 },
  { owner: "ollama", name: "ollama", description: "Run LLMs locally", deltaStars: 980 },
  { owner: "openai", name: "openai-python", description: "OpenAI Python SDK", deltaStars: 870 },
  { owner: "anthropics", name: "claude-code", description: "Claude in your terminal", deltaStars: 760 },
  { owner: "microsoft", name: "vscode", description: "Visual Studio Code", deltaStars: 650 },
  { owner: "tailwindlabs", name: "tailwindcss", description: "Utility-first CSS", deltaStars: 540 },
];

describe("buildTop8Tweet", () => {
  it("lists top repos with compact deltas and stays within tweet budget", () => {
    const text = buildTop8Tweet(SAMPLE, "today");
    expect(text).toContain("🔥 Today's Top 8 on GitHub (+7,600⭐)");
    expect(text).toContain("1. vercel/next.js +2.4k");
    expect(text).toContain("2. facebook/react +1.8k");
    expect(text).toContain("3. langchain-ai/langchain +1.2k");
    expect(text).toContain("…+5 more");
    expect(text).toContain("Full ranking → #Trending8");
    expect(text.length + 23 + 1).toBeLessThanOrEqual(280);
  });

  it("uses period-specific header labels", () => {
    const text = buildTop8Tweet(SAMPLE, "week");
    expect(text).toContain("🔥 This Week's Top 8 on GitHub");
  });

  it("falls back when repo names are very long", () => {
    const long = SAMPLE.map((r, i) => ({
      ...r,
      owner: "very-long-organization-name",
      name: `extremely-long-repository-name-${i}`,
    }));
    const text = buildTop8Tweet(long, "today");
    expect(text.length + 23 + 1).toBeLessThanOrEqual(280);
    expect(text).toContain("Full ranking → #Trending8");
  });
});
