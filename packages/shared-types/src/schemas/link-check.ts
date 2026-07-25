import { z } from 'zod';

/** Outcome of probing a single link found on the audited page. */
export const LinkStatusSchema = z.enum(['ok', 'broken', 'redirect', 'blocked', 'timeout']);
export type LinkStatus = z.infer<typeof LinkStatusSchema>;

export const LinkCheckSchema = z.object({
  url: z.string(),
  /** Anchor text, for identifying the link on the page. */
  text: z.string(),
  status: LinkStatusSchema,
  /** Absent when the request never completed (timeout, DNS failure, blocked). */
  httpStatus: z.number().int().nullable(),
  responseTimeMs: z.number().nonnegative().nullable(),
  isInternal: z.boolean(),
  /** Why it failed, when it did. */
  message: z.string().optional(),
});
export type LinkCheck = z.infer<typeof LinkCheckSchema>;

export const LinkCheckReportSchema = z.object({
  /** Links present on the page before the cap was applied. */
  totalFound: z.number().int().nonnegative(),
  /** How many we actually probed. May be < totalFound; see `truncated`. */
  checked: z.number().int().nonnegative(),
  broken: z.number().int().nonnegative(),
  /** True when totalFound exceeded the cap, so results are a sample. */
  truncated: z.boolean(),
  links: z.array(LinkCheckSchema),
});
export type LinkCheckReport = z.infer<typeof LinkCheckReportSchema>;

export const LinkCheckRequestSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2048, 'URL must be under 2048 characters'),
});
export type LinkCheckRequest = z.infer<typeof LinkCheckRequestSchema>;
