import { unstable_cache } from "next/cache";
import { getRepoReadmePreviewParagraphs } from "./readme-preview";

function readmeCacheKey(owner: string, name: string): string[] {
  return ["repo-readme", owner.toLowerCase(), name.toLowerCase()];
}

export function getCachedRepoReadmePreview(owner: string, name: string) {
  return unstable_cache(
    () => getRepoReadmePreviewParagraphs(owner, name),
    readmeCacheKey(owner, name),
    { revalidate: 86_400, tags: ["repo-readme"] },
  )();
}
