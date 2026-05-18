import type { HealthStatus } from "@github-trending/core";

const COLORS: Record<HealthStatus, string> = {
  active: "bg-accent",
  fair: "bg-warn",
  low: "bg-danger",
};

interface HealthDotProps {
  health: HealthStatus;
  label: string;
}

export function HealthDot({ health, label }: HealthDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" title={label}>
      <span className={`w-2 h-2 rounded-full ${COLORS[health]}`} />
      {label}
    </span>
  );
}
