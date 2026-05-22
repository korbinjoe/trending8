"use client";

import type { PhFavoriteItem, PhFavoriteSnapshot } from "@github-trending/core/types";
import { useCallback, useEffect, useState } from "react";
import {
  addPhFavorite,
  clearPhFavorites,
  readPhFavorites,
  removePhFavorite,
  sortPhFavoritesBySavedAt,
  togglePhFavorite,
  type PhFavoritesErrorCode,
  type PhFavoritesMutationResult,
} from "@/lib/ph-favorites-storage";

const PH_FAVORITES_CHANGED_EVENT = "gtp-ph-favorites-changed";

function notifyPhFavoritesChanged(): void {
  window.dispatchEvent(new Event(PH_FAVORITES_CHANGED_EVENT));
}

export function usePhFavorites() {
  const [items, setItems] = useState<PhFavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lastError, setLastError] = useState<PhFavoritesErrorCode | null>(null);

  const syncFromStorage = useCallback(() => {
    setItems(sortPhFavoritesBySavedAt(readPhFavorites()));
  }, []);

  useEffect(() => {
    syncFromStorage();
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "gtp-ph-favorites-v1") {
        syncFromStorage();
      }
    };
    const onLocalChange = () => syncFromStorage();

    window.addEventListener("storage", onStorage);
    window.addEventListener(PH_FAVORITES_CHANGED_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PH_FAVORITES_CHANGED_EVENT, onLocalChange);
    };
  }, [syncFromStorage]);

  const applyMutation = useCallback((result: PhFavoritesMutationResult) => {
    if (result.ok) {
      setLastError(null);
      setItems(sortPhFavoritesBySavedAt(result.items));
      notifyPhFavoritesChanged();
    } else {
      setLastError(result.code);
    }
    return result;
  }, []);

  const toggle = useCallback(
    (slug: string, snapshot?: PhFavoriteSnapshot) =>
      applyMutation(togglePhFavorite(slug, snapshot)),
    [applyMutation],
  );

  const add = useCallback(
    (slug: string, snapshot?: PhFavoriteSnapshot) =>
      applyMutation(addPhFavorite(slug, snapshot)),
    [applyMutation],
  );

  const remove = useCallback((slug: string) => {
    const next = removePhFavorite(slug);
    setLastError(null);
    setItems(sortPhFavoritesBySavedAt(next));
    notifyPhFavoritesChanged();
  }, []);

  const clearAll = useCallback(() => {
    clearPhFavorites();
    setItems([]);
    setLastError(null);
    notifyPhFavoritesChanged();
  }, []);

  const isSaved = useCallback(
    (slug: string) =>
      items.some(
        (item) => item.slug.toLowerCase() === slug.trim().toLowerCase(),
      ),
    [items],
  );

  return {
    items,
    hydrated,
    lastError,
    toggle,
    add,
    remove,
    clearAll,
    isSaved,
    count: items.length,
  };
}
