import { LogoIconImage } from "@/lib/logo-icon-image";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<LogoIconImage size={180} />, { ...size });
}
