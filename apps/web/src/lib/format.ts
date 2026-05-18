export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1)}k`;
  }
  return String(n);
}

export function formatRelativePush(
  iso: string | null,
  locale: string,
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      0,
      "day",
    );
  }
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    -days,
    "day",
  );
}
