import { z } from 'zod';

/**
 * Traffic-light status for a single check.
 * `green` = passing, `amber` = suboptimal, `red` = failing.
 */
export const MetricStatusSchema = z.enum(['green', 'amber', 'red']);
export type MetricStatus = z.infer<typeof MetricStatusSchema>;

/**
 * Scoring categories. Each check belongs to exactly one; category weights
 * are declared in `audit-score.ts` and must sum to 100.
 */
export const CheckCategorySchema = z.enum([
  'meta',
  'content',
  'indexability',
  'social',
  'accessibility',
]);
export type CheckCategory = z.infer<typeof CheckCategorySchema>;

/**
 * How urgently a failing check should be addressed. Drives the sort order of
 * the recommendations list in the UI.
 */
export const CheckPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type CheckPriority = z.infer<typeof CheckPrioritySchema>;

export const CheckIdSchema = z.enum([
  // meta
  'title',
  'metaDescription',
  // content
  'h1',
  'wordCount',
  'headingHierarchy',
  // indexability
  'canonical',
  'robotsMeta',
  'favicon',
  'httpStatus',
  'responseTime',
  // social
  'openGraph',
  'twitterCard',
  // accessibility
  'imageAlt',
  'htmlLang',
  'viewport',
  'inputLabels',
  'linkText',
]);
export type CheckId = z.infer<typeof CheckIdSchema>;

/**
 * The result of one audit check.
 *
 * `value` is the raw machine-readable measurement (used for comparisons and
 * JSON export); `displayValue` is the human string the UI renders. Keeping both
 * means the UI never has to re-derive formatting and the export stays precise.
 */
export const MetricCheckSchema = z.object({
  id: CheckIdSchema,
  label: z.string(),
  category: CheckCategorySchema,
  status: MetricStatusSchema,
  /** Raw measurement: char count, tag count, ms, boolean presence, etc. */
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  /** Preformatted for display, e.g. "56 characters", "Missing", "180 ms". */
  displayValue: z.string(),
  /** The target the check grades against, e.g. "30–60 characters". */
  recommendedValue: z.string(),
  /** What was found, in one sentence. */
  message: z.string(),
  /** What to do about it. Present even when passing, as reinforcement. */
  recommendation: z.string(),
  priority: CheckPrioritySchema,
  /** Points this check contributes within its category. */
  weight: z.number().positive(),
});
export type MetricCheck = z.infer<typeof MetricCheckSchema>;
