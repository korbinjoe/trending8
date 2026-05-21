import { describe, expect, it } from "vitest";
import { classifyPhLaunchLinkage } from "./launch-linkage";
import type { PhPostRow } from "./ph-signal-map";

function mockRow(overrides: Partial<PhPostRow>): PhPostRow {
  return {
    id: "1",
    phId: "ph1",
    slug: "my-app",
    name: "My App",
    tagline: null,
    description: null,
    phUrl: "https://www.producthunt.com/posts/my-app",
    websiteRedirect: null,
    resolvedUrl: null,
    githubOwner: null,
    githubName: null,
    repoId: null,
    votesCount: 10,
    commentsCount: 0,
    featuredAt: null,
    postedAt: new Date("2026-05-01T00:00:00Z"),
    topics: [],
    matchedVia: null,
    ingestedAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("classifyPhLaunchLinkage", () => {
  it("returns indexed when repo_id is set", () => {
    expect(classifyPhLaunchLinkage(mockRow({ repoId: "uuid" }))).toBe(
      "indexed",
    );
  });

  it("returns launch when github slug without repo_id", () => {
    expect(
      classifyPhLaunchLinkage(
        mockRow({ githubOwner: "octo", githubName: "hello" }),
      ),
    ).toBe("launch");
  });

  it("returns product when no github fields", () => {
    expect(classifyPhLaunchLinkage(mockRow({}))).toBe("product");
  });
});
