import type { HealthStatus } from "./health";
import { computeHealth, healthScore } from "./health";

export interface RepoSignals {
  owner: string;
  name: string;
  topics: string[];
  commits30d: number;
  totalStars: number;
}

export function computeDeltaStars(current: number, previous: number): number {
  return Math.max(0, current - previous);
}

export function isAwesomeList(repo: RepoSignals): boolean {
  const lowerName = repo.name.toLowerCase();
  if (lowerName.startsWith("awesome-") || lowerName === "awesome") {
    return true;
  }
  return repo.topics.some((t) => t.toLowerCase() === "awesome");
}

export function shouldExclude(
  repo: RepoSignals,
  options?: { includeNoise?: boolean },
): boolean {
  if (options?.includeNoise) return false;
  if (isAwesomeList(repo)) return true;
  if (repo.commits30d === 0) return true;
  return false;
}

export function isEarlySignal(
  totalStars: number,
  relativeVelocityPercentile: number,
): boolean {
  return totalStars < 5000 && relativeVelocityPercentile >= 0.8;
}

export function computeRelativeVelocityPercentile(
  deltaStars: number,
  bucketDeltas: number[],
): number {
  if (bucketDeltas.length === 0) return 0;
  const sorted = [...bucketDeltas].sort((a, b) => a - b);
  const below = sorted.filter((d) => d < deltaStars).length;
  return below / sorted.length;
}

export interface RankedRepo {
  owner: string;
  name: string;
  deltaStars: number;
  totalStars: number;
  health: HealthStatus;
  healthScoreValue: number;
  isEarly: boolean;
}

export function sortByVelocity(repos: RankedRepo[]): RankedRepo[] {
  return [...repos].sort((a, b) => b.deltaStars - a.deltaStars);
}

export function sortByHealthThenVelocity(repos: RankedRepo[]): RankedRepo[] {
  return [...repos].sort((a, b) => {
    const healthDiff = b.healthScoreValue - a.healthScoreValue;
    if (healthDiff !== 0) return healthDiff;
    return b.deltaStars - a.deltaStars;
  });
}

export function buildRankedRepo(
  owner: string,
  name: string,
  deltaStars: number,
  totalStars: number,
  commits30d: number,
  relativeVelocityPercentile: number,
): RankedRepo {
  const health = computeHealth(commits30d);
  return {
    owner,
    name,
    deltaStars,
    totalStars,
    health,
    healthScoreValue: healthScore(health),
    isEarly: isEarlySignal(totalStars, relativeVelocityPercentile),
  };
}
