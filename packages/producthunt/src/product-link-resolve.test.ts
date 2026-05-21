import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hasGithubProductLink,
  resolveGithubFromProductLinks,
} from "./product-link-resolve";

describe("hasGithubProductLink", () => {
  it("detects Github-typed links", () => {
    expect(
      hasGithubProductLink([{ type: "Github", url: "https://ph.com/r/x" }]),
    ).toBe(true);
    expect(
      hasGithubProductLink([{ type: "Website", url: "https://example.com" }]),
    ).toBe(false);
  });
});

describe("resolveGithubFromProductLinks", () => {
  const redirect = vi.hoisted(() => ({
    resolveGithubFromWebsite: vi.fn(),
    resolveWebsiteUrl: vi.fn(),
    resolveGithubFromWebsiteHtml: vi.fn(),
  }));

  vi.mock("./redirect", () => redirect);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("follows redirect for Github-typed PH short links", async () => {
    redirect.resolveGithubFromWebsite.mockResolvedValue({
      url: "https://github.com/acme/widget",
      owner: "acme",
      name: "widget",
    });

    await expect(
      resolveGithubFromProductLinks([
        { type: "Github", url: "https://www.producthunt.com/r/abc" },
      ]),
    ).resolves.toEqual({
      slug: { owner: "acme", name: "widget" },
      url: "https://github.com/acme/widget",
    });
  });

  it("scrapes resolved website HTML when redirect lands on product site", async () => {
    redirect.resolveWebsiteUrl.mockResolvedValue("https://example.com");
    redirect.resolveGithubFromWebsiteHtml.mockResolvedValue({
      slug: { owner: "acme", name: "demo" },
      url: "https://github.com/acme/demo",
    });

    await expect(
      resolveGithubFromProductLinks([
        { type: "Website", url: "https://www.producthunt.com/r/site" },
      ]),
    ).resolves.toEqual({
      slug: { owner: "acme", name: "demo" },
      url: "https://github.com/acme/demo",
    });
  });
});
