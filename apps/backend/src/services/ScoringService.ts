import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  CATEGORY_WEIGHTS,
  GRADE_BANDS,
  type AuditScore,
  type CategoryScore,
  type CheckCategory,
  type MetricCheck,
  type MetricStatus,
} from '@pagepulse/shared-types';

/** Fraction of a check's weight earned at each status. */
const STATUS_CREDIT: Record<MetricStatus, number> = {
  green: 1,
  amber: 0.5,
  red: 0,
};

/**
 * Turns graded checks into a single explainable score.
 *
 * Two-level weighting: each check carries a weight within its category, and
 * each category carries a weight toward the overall score (CATEGORY_WEIGHTS,
 * summing to 100). This means adding a check to a category redistributes
 * influence inside it without changing the category's overall share — so new
 * checks can't silently inflate or deflate the headline number.
 *
 * Categories with no checks are omitted and their weight is excluded from the
 * denominator, so a page is never penalised for a check that didn't run.
 */
export class ScoringService {
  calculateScore(checks: MetricCheck[]): AuditScore {
    const categories = this.scoreCategories(checks);

    const totalWeight = categories.reduce((sum, category) => sum + category.weight, 0);
    const totalEarned = categories.reduce((sum, category) => sum + category.earned, 0);
    const overall = totalWeight > 0 ? Math.round((totalEarned / totalWeight) * 100) : 0;

    const band = GRADE_BANDS.find((candidate) => overall >= candidate.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];

    return {
      overall,
      grade: band.grade,
      label: band.label,
      categories,
      passed: checks.filter((check) => check.status === 'green').length,
      warnings: checks.filter((check) => check.status === 'amber').length,
      failed: checks.filter((check) => check.status === 'red').length,
    };
  }

  private scoreCategories(checks: MetricCheck[]): CategoryScore[] {
    const categoryIds = Object.keys(CATEGORY_WEIGHTS) as CheckCategory[];

    return categoryIds
      .map((id) => this.scoreCategory(id, checks.filter((check) => check.category === id)))
      .filter((category): category is CategoryScore => category !== null);
  }

  private scoreCategory(id: CheckCategory, checks: MetricCheck[]): CategoryScore | null {
    if (checks.length === 0) return null;

    const possible = checks.reduce((sum, check) => sum + check.weight, 0);
    const earned = checks.reduce(
      (sum, check) => sum + check.weight * STATUS_CREDIT[check.status],
      0
    );

    const score = possible > 0 ? Math.round((earned / possible) * 100) : 0;
    const weight = CATEGORY_WEIGHTS[id];

    return {
      id,
      label: CATEGORY_LABELS[id],
      description: CATEGORY_DESCRIPTIONS[id],
      score,
      weight,
      // Derived from the unrounded ratio so per-category rounding doesn't
      // accumulate error in the overall total.
      earned: possible > 0 ? (earned / possible) * weight : 0,
      checkCount: checks.length,
    };
  }
}
