import { HERALDIC_MULLET_PATH } from "@/lib/logo-mark";

/** Heraldic four-pointed mullet (straight rays, cardinal points). */
export function LogoMark() {
  return (
    <svg
      className="logo-mark__star"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={HERALDIC_MULLET_PATH} />
    </svg>
  );
}
