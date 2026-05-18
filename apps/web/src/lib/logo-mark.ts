/** Heraldic four-pointed mullet path (viewBox 0 0 24 24). */
export const HERALDIC_MULLET_PATH =
  "M12 1 15.2 9 23 12 15.2 15 12 23 8.8 15 1 12 8.8 9Z";

export const LOGO_MARK_COLORS = {
  accent: "#3dd68c",
  accentDim: "#2a9d63",
  star: "#0c0e12",
} as const;

/** Star size relative to mark box (28px box → 20px star). */
export const LOGO_MARK_STAR_RATIO = 20 / 28;

/** Proportions match `.logo-mark` (28px box, 20px star, 7px radius). */
export function logoIconMetrics(size: number): {
  box: number;
  star: number;
  radius: number;
} {
  return {
    box: size,
    star: Math.round(size * LOGO_MARK_STAR_RATIO),
    radius: Math.round(size * (7 / 28)),
  };
}
