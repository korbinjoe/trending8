export type HealthStatus = "active" | "fair" | "low";

export function computeHealth(commits30d: number): HealthStatus {
  if (commits30d >= 5) return "active";
  if (commits30d >= 1) return "fair";
  return "low";
}

export function healthScore(status: HealthStatus): number {
  switch (status) {
    case "active":
      return 3;
    case "fair":
      return 2;
    case "low":
      return 1;
  }
}
