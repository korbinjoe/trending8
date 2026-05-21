import { describe, expect, it } from "vitest";
import {
  isPhTrackingUrl,
  phOutboundLinks,
} from "@github-trending/core/ph-signal-utils";
import {
  buildPhSignalFromRow,
  pickGithubUrl,
  pickWebsiteUrl,
  truncatePhDescription,
} from "@github-trending/producthunt";
import type { PhLeaderboardRow } from "@github-trending/producthunt";

function mockRow(overrides: Partial<PhLeaderboardRow>): PhLeaderboardRow {
  return {
    id: "1",
    phId: "ph1",
    slug: "emdash",
    name: "Emdash",
    tagline: "Open-source agents",
    description: "Long description text.",
    phUrl: "https://www.producthunt.com/products/emdash",
    websiteRedirect: "https://www.producthunt.com/r/abc",
    resolvedUrl: "https://github.com/generalaction/emdash",
    githubOwner: "generalaction",
    githubName: "emdash",
    repoId: null,
    votesCount: 100,
    commentsCount: 12,
    featuredAt: new Date("2026-05-20T07:00:00Z"),
    postedAt: new Date("2026-05-20T07:01:00Z"),
    topics: ["developer-tools", "open-source"],
    matchedVia: "url_query",
    ingestedAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("pickWebsiteUrl", () => {
  it("prefers non–PH-tracking product homepage", () => {
    expect(
      pickWebsiteUrl({
        resolvedUrl: "https://emdash.sh",
        websiteRedirect: "https://www.producthunt.com/r/x",
      }),
    ).toBe("https://emdash.sh");
  });

  it("does not use github.com as website when github is linked separately", () => {
    expect(
      pickWebsiteUrl({
        resolvedUrl: "https://github.com/generalaction/emdash",
        websiteRedirect: "https://www.producthunt.com/r/x",
      }),
    ).toBe("https://www.producthunt.com/r/x");
  });

  it("falls back to PH redirect when nothing else resolves", () => {
    expect(
      pickWebsiteUrl({
        resolvedUrl: null,
        websiteRedirect: "https://www.producthunt.com/r/x",
      }),
    ).toBe("https://www.producthunt.com/r/x");
  });
});

describe("buildPhSignalFromRow", () => {
  it("maps ingest fields into PhSignal", () => {
    const signal = buildPhSignalFromRow(mockRow({}));
    expect(signal.commentsCount).toBe(12);
    expect(signal.topics).toEqual(["developer-tools", "open-source"]);
    expect(signal.githubUrl).toBe("https://github.com/generalaction/emdash");
    expect(signal.websiteUrl).toBe("https://www.producthunt.com/r/abc");
    expect(signal.description).toBe("Long description text.");
  });
});

describe("phOutboundLinks", () => {
  it("shows website and github when urls differ", () => {
    const signal = buildPhSignalFromRow(mockRow({}));
    expect(phOutboundLinks(signal)).toEqual({
      github: "https://github.com/generalaction/emdash",
      website: "https://www.producthunt.com/r/abc",
    });
  });

  it("keeps distinct website and github", () => {
    const signal = buildPhSignalFromRow(
      mockRow({ resolvedUrl: "https://emdash.sh" }),
    );
    expect(phOutboundLinks(signal)).toEqual({
      github: "https://github.com/generalaction/emdash",
      website: "https://emdash.sh",
    });
  });
});

describe("truncatePhDescription", () => {
  it("truncates long text", () => {
    const long = "a".repeat(250);
    expect(truncatePhDescription(long)?.endsWith("…")).toBe(true);
  });
});

describe("isPhTrackingUrl", () => {
  it("detects producthunt.com/r links", () => {
    expect(isPhTrackingUrl("https://www.producthunt.com/r/abc")).toBe(true);
    expect(isPhTrackingUrl("https://emdash.sh")).toBe(false);
  });
});

describe("pickGithubUrl", () => {
  it("returns canonical repo URL", () => {
    expect(
      pickGithubUrl({ githubOwner: "acme", githubName: "demo" }),
    ).toBe("https://github.com/acme/demo");
  });
});
