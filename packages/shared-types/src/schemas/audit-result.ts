import { z } from 'zod';
import { MetricCheckSchema } from './audit-metrics';
import { AuditScoreSchema } from './audit-score';

/**
 * Raw extracted facts about the page, kept alongside the graded checks.
 *
 * Checks answer "is this good?"; details answer "what exactly was found?".
 * The UI shows details verbatim (actual title text, canonical URL) and the JSON
 * export carries them so a report is self-contained.
 */
export const AuditDetailsSchema = z.object({
  title: z.string().nullable(),
  metaDescription: z.string().nullable(),
  h1s: z.array(z.string()),
  headings: z.array(z.object({ level: z.number().int().min(1).max(6), text: z.string() })),
  canonicalUrl: z.string().nullable(),
  robotsMeta: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  htmlLang: z.string().nullable(),
  viewport: z.string().nullable(),
  wordCount: z.number().int().nonnegative(),
  imageCount: z.number().int().nonnegative(),
  imagesMissingAlt: z.number().int().nonnegative(),
  linkCount: z.number().int().nonnegative(),
  internalLinkCount: z.number().int().nonnegative(),
  externalLinkCount: z.number().int().nonnegative(),
  openGraph: z.record(z.string(), z.string()),
  twitterCard: z.record(z.string(), z.string()),
});
export type AuditDetails = z.infer<typeof AuditDetailsSchema>;

export const AuditResultSchema = z.object({
  /** UUID; the key for share links via GET /api/v1/audit/:id. */
  id: z.string(),
  /** Normalized URL as requested. */
  url: z.string(),
  /** Where we actually landed after redirects. Differs from `url` on redirect. */
  finalUrl: z.string(),
  httpStatus: z.number().int(),
  responseTimeMs: z.number().nonnegative(),
  contentType: z.string(),
  auditedAt: z.string(),
  score: AuditScoreSchema,
  checks: z.array(MetricCheckSchema),
  details: AuditDetailsSchema,
});
export type AuditResult = z.infer<typeof AuditResultSchema>;
