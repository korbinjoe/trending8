import { afterEach, describe, expect, it, vi } from "vitest";

const fetchPostByGithubUrl = vi.hoisted(() => vi.fn());

vi.mock("./posts", () => ({
  fetchPostByGithubUrl,
}));

import {
  resolveGithubViaPhReverseLookup,
  searchGithubReposByName,
} from "./ph-github-lookup";

describe("searchGithubReposByName", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns normalized slugs from GitHub search", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ full_name: "generalaction/emdash" }],
      }),
    });

    await expect(searchGithubReposByName("emdash")).resolves.toEqual([
      { owner: "generalaction", name: "emdash" },
    ]);
  });
});

describe("resolveGithubViaPhReverseLookup", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns slug when PH posts(url) matches post slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            { full_name: "emdash-cms/emdash" },
            { full_name: "generalaction/emdash" },
          ],
        }),
      }),
    );

    fetchPostByGithubUrl.mockImplementation(async (url: string) => {
      if (url.includes("generalaction/emdash")) {
        return { slug: "emdash" };
      }
      return null;
    });

    await expect(resolveGithubViaPhReverseLookup("emdash", "emdash")).resolves.toEqual({
      slug: { owner: "generalaction", name: "emdash" },
      url: "https://github.com/generalaction/emdash",
    });

    expect(fetchPostByGithubUrl).toHaveBeenCalledWith(
      "https://github.com/generalaction/emdash",
      undefined,
    );
  });
});
