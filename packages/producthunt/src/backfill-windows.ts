/** UTC instant N calendar days before `from` (same time-of-day). */
export function utcDaysAgo(days: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export interface PhBackfillWindow {
  /** Inclusive lower bound for `posted_at`. */
  postedAfter: Date;
  /** Exclusive upper bound for `posted_at`. */
  postedBefore: Date;
}

/**
 * Splits [now - lookbackDays, now) into contiguous windows of `chunkDays`.
 * Oldest window first (stable progress logging).
 */
export function buildPhBackfillWindows(
  lookbackDays: number,
  chunkDays: number,
  from: Date = new Date(),
): PhBackfillWindow[] {
  if (lookbackDays <= 0 || chunkDays <= 0) return [];

  const windows: PhBackfillWindow[] = [];
  const fullChunks = Math.floor(lookbackDays / chunkDays);
  const remainder = lookbackDays % chunkDays;

  for (let i = fullChunks; i >= 1; i--) {
    const endDays = i * chunkDays;
    const startDays = endDays - chunkDays;
    windows.push({
      postedAfter: utcDaysAgo(endDays, from),
      postedBefore: utcDaysAgo(startDays, from),
    });
  }

  if (remainder > 0) {
    windows.unshift({
      postedAfter: utcDaysAgo(lookbackDays, from),
      postedBefore: utcDaysAgo(fullChunks * chunkDays, from),
    });
  }

  return windows;
}
