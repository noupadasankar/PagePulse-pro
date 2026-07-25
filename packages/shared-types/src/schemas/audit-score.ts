import { z } from 'zod';
import { CheckCategorySchema, type CheckCategory } from './audit-metrics';

/**
 * Category weights, in points, out of 100.
 *
 * The docs define per-check green/amber/red thresholds but no overall formula,
 * so this weighting is our own: indexability and meta dominate because a page
 * that can't be indexed or has no title fails at SEO regardless of how good its
 * social tags are. Surfaced in the UI so the score is explainable rather than
 * a magic number.
 *
 * Invariant: values sum to 100. Enforced by a unit test.
 */
export const CATEGORY_WEIGHTS: Record<CheckCategory, number> = {
  meta: 30,
  indexability: 25,
  content: 20,
  social: 15,
  accessibility: 10,
};

export const CATEGORY_LABELS: Record<CheckCategory, string> = {
  meta: 'Meta Tags',
  indexability: 'Indexability',
  content: 'Content',
  social: 'Social Sharing',
  accessibility: 'Accessibility',
};

export const CATEGORY_DESCRIPTIONS: Record<CheckCategory, string> = {
  meta: 'Title and description tags that determine how you appear in search results.',
  indexability: 'Whether search engines can crawl, index, and reach this page quickly.',
  content: 'Depth and structure of the page content and its heading outline.',
  social: 'Open Graph and Twitter Card tags controlling link previews when shared.',
  accessibility: 'Basic checks that the page is usable with assistive technology.',
};

/** Letter grade bands, highest first. */
export const GRADE_BANDS = [
  { min: 90, grade: 'A', label: 'Excellent' },
  { min: 80, grade: 'B', label: 'Good' },
  { min: 70, grade: 'C', label: 'Fair' },
  { min: 50, grade: 'D', label: 'Needs Work' },
  { min: 0, grade: 'F', label: 'Critical' },
] as const;

export const ScoreGradeSchema = z.enum(['A', 'B', 'C', 'D', 'F']);
export type ScoreGrade = z.infer<typeof ScoreGradeSchema>;

export const CategoryScoreSchema = z.object({
  id: CheckCategorySchema,
  label: z.string(),
  description: z.string(),
  /** 0–100 within this category alone. */
  score: z.number().min(0).max(100),
  /** This category's share of the overall score, in points out of 100. */
  weight: z.number().positive(),
  /** Weighted points actually earned, i.e. score/100 * weight. */
  earned: z.number().min(0),
  checkCount: z.number().int().nonnegative(),
});
export type CategoryScore = z.infer<typeof CategoryScoreSchema>;

export const AuditScoreSchema = z.object({
  /** Weighted total, 0–100. */
  overall: z.number().min(0).max(100),
  grade: ScoreGradeSchema,
  /** Human label for the grade, e.g. "Excellent". */
  label: z.string(),
  categories: z.array(CategoryScoreSchema),
  /** Counts by status. Sum equals the total number of checks run. */
  passed: z.number().int().nonnegative(),
  warnings: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});
export type AuditScore = z.infer<typeof AuditScoreSchema>;
