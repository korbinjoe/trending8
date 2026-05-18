import { z } from "zod";

export const FeedViewSchema = z.enum(["velocity", "early"]);
export const FeedPeriodSchema = z.enum([
  "today",
  "week",
  "month",
  "halfYear",
  "year",
]);
export const HealthStatusSchema = z.enum(["active", "fair", "low"]);

export const AlternativeItemSchema = z.object({
  owner: z.string(),
  name: z.string(),
  slug: z.string(),
  why: z.string().optional(),
});

export const FeedItemSchema = z.object({
  rank: z.number(),
  owner: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  deltaStars: z.number(),
  totalStars: z.number(),
  health: HealthStatusSchema,
  tags: z.array(z.string()),
  isEarlySignal: z.boolean(),
  triggers: z.array(z.string()).optional(),
  alternatives: z.array(AlternativeItemSchema).max(2),
  compareUrl: z.string().optional(),
});

export const FeedResponseSchema = z.object({
  items: z.array(FeedItemSchema),
  nextCursor: z.string().nullable(),
  rankingRunId: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const RepoDetailSchema = z.object({
  owner: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  deltaStars: z.number(),
  totalStars: z.number(),
  health: HealthStatusSchema,
  tags: z.array(z.string()),
  commits30d: z.number(),
  lastPush: z.string().nullable(),
  license: z.string().nullable(),
  language: z.string().nullable(),
  urls: z.object({
    github: z.string(),
    starHistory: z.string(),
    ossInsight: z.string(),
    bestOfJs: z.string().optional(),
  }),
});

export const CompareRowSchema = z.object({
  dimension: z.string(),
  values: z.array(z.string()),
});

export const CompareResponseSchema = z.object({
  repos: z.array(
    z.object({
      owner: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
  rows: z.array(CompareRowSchema),
  sort: z.enum(["health", "velocity"]),
  starHistoryUrl: z.string(),
});

export type FeedView = z.infer<typeof FeedViewSchema>;
export type FeedPeriod = z.infer<typeof FeedPeriodSchema>;
export type ApiHealthStatus = z.infer<typeof HealthStatusSchema>;
export type FeedItem = z.infer<typeof FeedItemSchema>;
export type FeedResponse = z.infer<typeof FeedResponseSchema>;
export type RepoDetail = z.infer<typeof RepoDetailSchema>;
export type CompareResponse = z.infer<typeof CompareResponseSchema>;
