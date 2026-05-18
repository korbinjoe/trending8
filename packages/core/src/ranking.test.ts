import { describe, expect, it } from "vitest";
import {
  computeDeltaStars,
  computeRelativeVelocityPercentile,
  isEarlySignal,
  shouldExclude,
} from "./ranking";
import { computeHealth } from "./health";

describe("computeDeltaStars", () => {
  it("returns non-negative delta", () => {
    expect(computeDeltaStars(100, 80)).toBe(20);
    expect(computeDeltaStars(50, 100)).toBe(0);
  });
});

describe("computeHealth", () => {
  it("maps commit counts to status", () => {
    expect(computeHealth(10)).toBe("active");
    expect(computeHealth(3)).toBe("fair");
    expect(computeHealth(0)).toBe("low");
  });
});

describe("shouldExclude", () => {
  it("excludes awesome lists and zero-commit repos", () => {
    expect(
      shouldExclude({
        owner: "a",
        name: "awesome-go",
        topics: [],
        commits30d: 5,
        totalStars: 100,
      }),
    ).toBe(true);
    expect(
      shouldExclude({
        owner: "a",
        name: "tool",
        topics: ["awesome"],
        commits30d: 5,
        totalStars: 100,
      }),
    ).toBe(true);
    expect(
      shouldExclude({
        owner: "a",
        name: "tool",
        topics: [],
        commits30d: 0,
        totalStars: 100,
      }),
    ).toBe(true);
  });

  it("allows noise when flag set", () => {
    expect(
      shouldExclude(
        {
          owner: "a",
          name: "tool",
          topics: [],
          commits30d: 0,
          totalStars: 100,
        },
        { includeNoise: true },
      ),
    ).toBe(false);
  });
});

describe("isEarlySignal", () => {
  it("requires low stars and top percentile", () => {
    expect(isEarlySignal(3000, 0.85)).toBe(true);
    expect(isEarlySignal(6000, 0.9)).toBe(false);
    expect(isEarlySignal(1000, 0.5)).toBe(false);
  });
});

describe("computeRelativeVelocityPercentile", () => {
  it("computes percentile in bucket", () => {
    expect(computeRelativeVelocityPercentile(50, [10, 20, 30, 40, 50])).toBe(
      0.8,
    );
  });
});
