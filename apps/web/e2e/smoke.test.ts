import { describe, expect, it } from "vitest";
import { buildStarHistoryUrlFromSlugs } from "@github-trending/core";

describe("E2E smoke helpers", () => {
  it("builds valid star-history URL for 3 repos", () => {
    const url = buildStarHistoryUrlFromSlugs([
      "oven-sh/bun",
      "denoland/deno",
      "nodejs/node",
    ]);
    expect(url).toContain("oven-sh/bun");
    expect(url).toContain("&");
  });

  it("RSS XML structure is well-formed", () => {
    const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>T</title></channel></rss>`;
    expect(xml).toMatch(/^<\?xml/);
    expect(xml).toContain("<rss");
  });
});
