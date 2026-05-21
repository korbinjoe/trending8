import type { PhLaunchLinkage } from "@github-trending/core/types";
import type { PhPostRow } from "./ph-signal-map";

export function classifyPhLaunchLinkage(row: PhPostRow): PhLaunchLinkage {
  if (row.repoId) return "indexed";
  if (row.githubOwner && row.githubName) return "launch";
  return "product";
}
