import { describe, expect, it } from "vitest";
import {
  buildStarHistoryUrl,
  buildStarHistoryUrlFromSlugs,
  parseRepoSlug,
} from "./star-history";

describe("parseRepoSlug", () => {
  it("parses owner/name", () => {
    expect(parseRepoSlug("oven-sh/bun")).toEqual({
      owner: "oven-sh",
      name: "bun",
    });
    expect(parseRepoSlug("invalid")).toBeNull();
  });
});

describe("buildStarHistoryUrl", () => {
  it("builds multi-repo URL", () => {
    expect(
      buildStarHistoryUrl([
        { owner: "a", name: "b" },
        { owner: "c", name: "d" },
      ]),
    ).toBe("https://star-history.com/#a/b&c/d");
  });
});

describe("buildStarHistoryUrlFromSlugs", () => {
  it("builds from slug strings", () => {
    expect(
      buildStarHistoryUrlFromSlugs(["oven-sh/bun", "denoland/deno"]),
    ).toBe("https://star-history.com/#oven-sh/bun&denoland/deno");
  });
});
