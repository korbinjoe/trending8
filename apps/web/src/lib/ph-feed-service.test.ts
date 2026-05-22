import { describe, expect, it, vi } from "vitest";
import { classifyPhEntryKind } from "./ph-feed-kind";

vi.mock("@github-trending/db", () => ({
  getDb: vi.fn(),
  periodMetrics: {},
  productHuntPosts: {},
  repositories: {},
}));

vi.mock("@github-trending/producthunt", () => ({
  getPhLeaderboardPosts: vi.fn(),
  countPhLeaderboardPosts: vi.fn(),
}));

vi.mock("@github-trending/github", () => ({
  getAlternativesForRepos: vi.fn(),
}));

vi.mock("./ranking-run-cache", () => ({
  getCachedLatestCompletedRun: vi.fn(),
}));

describe("classifyPhEntryKind for no-github PH rows", () => {
  it("classifies posts without github as product", () => {
    expect(
      classifyPhEntryKind({
        id: "1",
        phId: "ph1",
        slug: "solo-app",
        name: "Solo App",
        tagline: null,
        description: null,
        phUrl: "https://www.producthunt.com/posts/solo-app",
        websiteRedirect: null,
        resolvedUrl: null,
        githubOwner: null,
        githubName: null,
        repoId: null,
        votesCount: 42,
        commentsCount: 0,
        featuredAt: null,
        postedAt: new Date("2026-05-01T00:00:00Z"),
        topics: [],
        matchedVia: null,
        ingestedAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toBe("product");
  });
});
