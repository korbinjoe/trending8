import { afterEach, describe, expect, it } from "vitest";
import {
  addPhFavorite,
  clearPhFavorites,
  phFavoriteKey,
  readPhFavorites,
  removePhFavorite,
  togglePhFavorite,
} from "./ph-favorites-storage";

const storage = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  },
  configurable: true,
});

afterEach(() => {
  storage.clear();
  clearPhFavorites();
});

describe("ph-favorites-storage", () => {
  it("dedupes slug case-insensitively", () => {
    addPhFavorite("My-Launch");
    const firstSavedAt = readPhFavorites()[0]?.savedAt;
    addPhFavorite("my-launch");
    expect(readPhFavorites()).toHaveLength(1);
    expect(readPhFavorites()[0]?.savedAt).not.toBe(firstSavedAt);
  });

  it("rejects empty slug", () => {
    const result = addPhFavorite(" ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_id");
    expect(readPhFavorites()).toHaveLength(0);
  });

  it("toggles favorite", () => {
    togglePhFavorite("acme-app");
    expect(readPhFavorites()).toHaveLength(1);
    togglePhFavorite("acme-app");
    expect(readPhFavorites()).toHaveLength(0);
  });

  it("normalizes favorite key", () => {
    expect(phFavoriteKey("  Foo-Bar ")).toBe("foo-bar");
  });

  it("removePhFavorite drops entry", () => {
    addPhFavorite("slug-a");
    removePhFavorite("slug-a");
    expect(readPhFavorites()).toHaveLength(0);
  });
});
