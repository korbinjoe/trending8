import { describe, expect, it } from "vitest";
import { buildPhBackfillWindows, utcDaysAgo } from "./backfill-windows";

const NOW = new Date("2026-05-21T12:00:00.000Z");

describe("utcDaysAgo", () => {
  it("subtracts UTC calendar days", () => {
    expect(utcDaysAgo(7, NOW).toISOString()).toBe("2026-05-14T12:00:00.000Z");
  });
});

describe("buildPhBackfillWindows", () => {
  it("returns empty for invalid input", () => {
    expect(buildPhBackfillWindows(0, 30, NOW)).toEqual([]);
    expect(buildPhBackfillWindows(30, 0, NOW)).toEqual([]);
  });

  it("splits 90d lookback into 30d chunks oldest-first", () => {
    const windows = buildPhBackfillWindows(90, 30, NOW);
    expect(windows).toHaveLength(3);
    expect(windows[0]?.postedAfter.toISOString()).toBe("2026-02-20T12:00:00.000Z");
    expect(windows[0]?.postedBefore.toISOString()).toBe("2026-03-22T12:00:00.000Z");
    expect(windows[2]?.postedBefore.toISOString()).toBe("2026-05-21T12:00:00.000Z");
  });

  it("adds remainder window when lookback not divisible by chunk", () => {
    const windows = buildPhBackfillWindows(365, 30, NOW);
    expect(windows[0]?.postedAfter.toISOString()).toBe("2025-05-21T12:00:00.000Z");
    expect(windows[0]?.postedBefore.toISOString()).toBe("2025-05-26T12:00:00.000Z");
    expect(windows).toHaveLength(13);
  });
});
