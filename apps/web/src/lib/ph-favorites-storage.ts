import {
  PH_FAVORITES_MAX_ITEMS,
  PH_FAVORITES_STORAGE_KEY,
  PhFavoritesDocumentSchema,
  type PhFavoriteItem,
  type PhFavoriteSnapshot,
  type PhFavoritesDocument,
} from "@github-trending/core/types";

export type PhFavoritesErrorCode = "invalid_id" | "limit_reached";

export type PhFavoritesMutationResult =
  | { ok: true; items: PhFavoriteItem[] }
  | { ok: false; code: PhFavoritesErrorCode };

export function phFavoriteKey(slug: string): string {
  return slug.trim().toLowerCase();
}

function normalizeSlug(slug: string): string | null {
  const s = slug.trim();
  return s ? s : null;
}

function storageAvailable(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function readPhFavorites(): PhFavoriteItem[] {
  if (!storageAvailable()) return [];
  try {
    const raw = localStorage.getItem(PH_FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const doc = PhFavoritesDocumentSchema.safeParse(parsed);
    if (!doc.success) return [];
    return doc.data.items;
  } catch {
    return [];
  }
}

export function writePhFavorites(items: PhFavoriteItem[]): void {
  if (!storageAvailable()) return;
  const doc: PhFavoritesDocument = { version: 1, items };
  localStorage.setItem(PH_FAVORITES_STORAGE_KEY, JSON.stringify(doc));
}

export function isPhFavorited(items: PhFavoriteItem[], slug: string): boolean {
  const key = phFavoriteKey(slug);
  return items.some((item) => phFavoriteKey(item.slug) === key);
}

export function addPhFavorite(
  slug: string,
  snapshot?: PhFavoriteSnapshot,
): PhFavoritesMutationResult {
  const normalized = normalizeSlug(slug);
  if (!normalized) return { ok: false, code: "invalid_id" };

  const items = readPhFavorites();
  const key = phFavoriteKey(normalized);
  const now = new Date().toISOString();
  const existingIdx = items.findIndex(
    (item) => phFavoriteKey(item.slug) === key,
  );

  if (existingIdx >= 0) {
    const existing = items[existingIdx]!;
    const updated: PhFavoriteItem = {
      ...existing,
      slug: normalized,
      savedAt: now,
      snapshot: snapshot ?? existing.snapshot,
    };
    const next = [...items];
    next[existingIdx] = updated;
    writePhFavorites(next);
    return { ok: true, items: next };
  }

  if (items.length >= PH_FAVORITES_MAX_ITEMS) {
    return { ok: false, code: "limit_reached" };
  }

  const entry: PhFavoriteItem = {
    slug: normalized,
    savedAt: now,
    snapshot,
  };
  const next = [entry, ...items];
  writePhFavorites(next);
  return { ok: true, items: next };
}

export function removePhFavorite(slug: string): PhFavoriteItem[] {
  const key = phFavoriteKey(slug);
  const next = readPhFavorites().filter(
    (item) => phFavoriteKey(item.slug) !== key,
  );
  writePhFavorites(next);
  return next;
}

export function togglePhFavorite(
  slug: string,
  snapshot?: PhFavoriteSnapshot,
): PhFavoritesMutationResult {
  if (isPhFavorited(readPhFavorites(), slug)) {
    return { ok: true, items: removePhFavorite(slug) };
  }
  return addPhFavorite(slug, snapshot);
}

export function clearPhFavorites(): void {
  writePhFavorites([]);
}

export function sortPhFavoritesBySavedAt(items: PhFavoriteItem[]): PhFavoriteItem[] {
  return [...items].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}
