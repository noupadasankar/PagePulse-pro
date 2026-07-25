import { describe, it, expect } from 'vitest';
import { CATEGORY_WEIGHTS, type MetricCheck } from '@pagepulse/shared-types';
import { ScoringService } from '../../src/services/ScoringService';

const scoringService = new ScoringService();

/** Minimal check factory — only the fields scoring actually reads. */
function check(overrides: Partial<MetricCheck> = {}): MetricCheck {
  return {
    id: 'title',
    label: 'Page Title',
    category: 'meta',
    status: 'green',
    value: 1,
    displayValue: '1',
    recommendedValue: '1',
    message: 'message',
    recommendation: 'recommendation',
    priority: 'low',
    weight: 1,
    ...overrides,
  };
}

/** One check in every category, all at the given status. */
function oneCheckPerCategory(status: MetricCheck['status']): MetricCheck[] {
  return (Object.keys(CATEGORY_WEIGHTS) as MetricCheck['category'][]).map((category) =>
    check({ category, status })
  );
}

describe('ScoringService', () => {
  it('declares category weights summing to 100', () => {
    const total = Object.values(CATEGORY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    expect(total).toBe(100);
  });

  it('scores an all-green page as 100 with grade A', () => {
    const score = scoringService.calculateScore(oneCheckPerCategory('green'));

    expect(score.overall).toBe(100);
    expect(score.grade).toBe('A');
    expect(score.label).toBe('Excellent');
  });

  it('scores an all-red page as 0 with grade F', () => {
    const score = scoringService.calculateScore(oneCheckPerCategory('red'));

    expect(score.overall).toBe(0);
    expect(score.grade).toBe('F');
  });

  it('gives amber checks half credit', () => {
    const score = scoringService.calculateScore(oneCheckPerCategory('amber'));
    expect(score.overall).toBe(50);
  });

  it('counts each status independently of the score', () => {
    const score = scoringService.calculateScore([
      check({ status: 'green' }),
      check({ status: 'green' }),
      check({ status: 'amber' }),
      check({ status: 'red' }),
    ]);

    expect(score.passed).toBe(2);
    expect(score.warnings).toBe(1);
    expect(score.failed).toBe(1);
    expect(score.passed + score.warnings + score.failed).toBe(4);
  });

  it('weights checks within a category by their individual weight', () => {
    // A failing weight-3 check against a passing weight-1 check: 1 of 4 points.
    const score = scoringService.calculateScore([
      check({ category: 'meta', status: 'red', weight: 3 }),
      check({ category: 'meta', status: 'green', weight: 1 }),
    ]);

    expect(score.categories[0].score).toBe(25);
  });

  it('excludes categories with no checks from the denominator', () => {
    // Only meta ran, and it passed, so the page scores 100 rather than being
    // penalised for the four categories that never executed.
    const score = scoringService.calculateScore([check({ category: 'meta', status: 'green' })]);

    expect(score.overall).toBe(100);
    expect(score.categories).toHaveLength(1);
    expect(score.categories[0].id).toBe('meta');
  });

  it('weights categories against each other by CATEGORY_WEIGHTS', () => {
    // meta (30) fails, accessibility (10) passes => 10 of 40 possible points.
    const score = scoringService.calculateScore([
      check({ category: 'meta', status: 'red' }),
      check({ category: 'accessibility', status: 'green' }),
    ]);

    expect(score.overall).toBe(25);
  });

  it('reports per-category detail for the UI breakdown', () => {
    const score = scoringService.calculateScore([
      check({ category: 'meta', status: 'green' }),
      check({ category: 'meta', status: 'red' }),
    ]);

    const meta = score.categories.find((category) => category.id === 'meta');
    expect(meta).toMatchObject({
      id: 'meta',
      label: 'Meta Tags',
      score: 50,
      weight: CATEGORY_WEIGHTS.meta,
      checkCount: 2,
    });
  });

  it.each([
    [95, 'A'],
    [90, 'A'],
    [89, 'B'],
    [80, 'B'],
    [79, 'C'],
    [70, 'C'],
    [69, 'D'],
    [50, 'D'],
    [49, 'F'],
    [0, 'F'],
  ])('maps a score of %i to grade %s', (target, expectedGrade) => {
    // Build a single category whose score lands exactly on `target`.
    const checks = [
      check({ category: 'meta', status: 'green', weight: target }),
      check({ category: 'meta', status: 'red', weight: 100 - target }),
    ].filter((candidate) => candidate.weight > 0);

    expect(scoringService.calculateScore(checks).grade).toBe(expectedGrade);
  });

  it('returns a zero score when no checks ran at all', () => {
    const score = scoringService.calculateScore([]);

    expect(score.overall).toBe(0);
    expect(score.grade).toBe('F');
    expect(score.categories).toEqual([]);
  });
});
