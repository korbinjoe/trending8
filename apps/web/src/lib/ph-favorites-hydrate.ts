import {
  PhFavoritesHydrateResponseSchema,
  type PhFavoriteHydrateResult,
} from "@github-trending/core/types";

const HYDRATE_BATCH_SIZE = 50;

export async function hydratePhFavoritesClient(
  slugs: string[],
): Promise<PhFavoriteHydrateResult[]> {
  if (slugs.length === 0) return [];

  const merged: PhFavoriteHydrateResult[] = [];
  for (let i = 0; i < slugs.length; i += HYDRATE_BATCH_SIZE) {
    const batch = slugs.slice(i, i + HYDRATE_BATCH_SIZE);
    const res = await fetch("/api/favorites/ph-hydrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: batch }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "PH hydrate failed");
    }

    const json: unknown = await res.json();
    const parsed = PhFavoritesHydrateResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Invalid PH hydrate response");
    }
    merged.push(...parsed.data.items);
  }

  return merged;
}
