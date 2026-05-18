import type { CSSProperties } from "react";
import { LOGO_MARK_COLORS, logoIconMetrics } from "./logo-mark";

/** Clip-path star for `next/og` ImageResponse (Satori does not render nested SVG reliably). */
const HERALDIC_MULLET_CLIP =
  "polygon(50% 4.17%, 63.33% 37.5%, 95.83% 50%, 63.33% 62.5%, 50% 95.83%, 36.67% 62.5%, 4.17% 50%, 36.67% 37.5%)";

export function LogoIconImage({ size }: { size: number }) {
  const { box, star, radius } = logoIconMetrics(size);
  const containerStyle: CSSProperties = {
    width: box,
    height: box,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(135deg, ${LOGO_MARK_COLORS.accent} 0%, ${LOGO_MARK_COLORS.accentDim} 100%)`,
    borderRadius: radius,
  };
  const starStyle: CSSProperties = {
    width: star,
    height: star,
    background: LOGO_MARK_COLORS.star,
    clipPath: HERALDIC_MULLET_CLIP,
  };

  return (
    <div style={containerStyle}>
      <div style={starStyle} />
    </div>
  );
}
