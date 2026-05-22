import { describe, expect, it } from "vitest";
import {
  formatPhVotesMetric,
  githubSlugFromUrl,
  isPhTrackingUrl,
  phOutboundLinks,
} from "./ph-signal-utils";

describe("phOutboundLinks", () => {
  it("dedupes github and website", () => {
    expect(
      phOutboundLinks({
        slug: "x",
        phUrl: "https://ph.com/x",
        votesCount: 1,
        featuredAt: null,
        postedAt: "2026-01-01",
        githubUrl: "https://github.com/a/b",
        websiteUrl: "https://github.com/a/b",
      }),
    ).toEqual({ github: "https://github.com/a/b", website: undefined });
  });
});

describe("isPhTrackingUrl", () => {
  it("detects PH /r/ links", () => {
    expect(isPhTrackingUrl("https://www.producthunt.com/r/abc")).toBe(true);
  });
});

describe("formatPhVotesMetric", () => {
  it("formats votes like star delta", () => {
    expect(formatPhVotesMetric(257, "en")).toBe("+257 ↑");
    expect(formatPhVotesMetric(1234, "en")).toBe("+1,234 ↑");
  });
});

describe("githubSlugFromUrl", () => {
  it("parses owner/name", () => {
    expect(
      githubSlugFromUrl("https://github.com/generalaction/emdash"),
    ).toBe("generalaction/emdash");
  });
});
