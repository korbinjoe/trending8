import type { HealthStatus } from "@github-trending/core";

const DOT_CLASS: Record<HealthStatus, string> = {
  active: "dot",
  fair: "dot dot--warn",
  low: "dot dot--bad",
};

interface HealthDotProps {
  health: HealthStatus;
  label: string;
}

export function HealthDot({ health, label }: HealthDotProps) {
  return (
    <span className="health">
      <span className={DOT_CLASS[health]} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
