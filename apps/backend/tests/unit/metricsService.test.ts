import { describe, it, expect } from 'vitest';
import type { MetricCheck } from '@pagepulse/shared-types';
import { MetricsService } from '../../src/services/MetricsService';
import type { FetchResult, ParsedHtml } from '../../src/types/audit.types';

const metricsService = new MetricsService();

const fetchResult: FetchResult = {
  html: '<html></html>',
  status: 200,
  headers: { 'content-type': 'text/html' },
  durationMs: 450,
  finalUrl: 'https://example.com/',
  contentType: 'text/html',
};

/** A page that should pass every check. */
const perfectPage: ParsedHtml = {
  title: 'A Perfectly Sized Title For Search Engine Results',
  metaDescription:
    'This meta description sits comfortably between one hundred twenty and one hundred sixty characters, which is the ideal window for search.',
  h1s: ['Single Main Heading'],
  headings: [
    { level: 1, text: 'Single Main Heading' },
    { level: 2, text: 'A Subsection' },
  ],
  images: [{ src: 'https://example.com/a.jpg', alt: 'A described image', missingAlt: false }],
  links: [{ href: 'https://example.com/about', text: 'About our company', isInternal: true }],
  visibleText: 'word '.repeat(350),
  wordCount: 350,
  canonicalUrl: 'https://example.com/',
  robotsMeta: 'index, follow',
  faviconUrl: 'https://example.com/favicon.ico',
  htmlLang: 'en',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: { title: 'T', description: 'D', image: 'https://example.com/og.png' },
  twitterCard: { card: 'summary_large_image', title: 'T', description: 'D' },
  inputs: [{ hasLabel: true, type: 'text' }],
};

/** A page that should fail every check. */
const brokenPage: ParsedHtml = {
  title: null,
  metaDescription: null,
  h1s: [],
  headings: [],
  images: Array.from({ length: 5 }, (_, i) => ({
    src: `https://example.com/${i}.jpg`,
    alt: null,
    missingAlt: true,
  })),
  links: [{ href: 'https://example.com/x', text: 'click here', isInternal: true }],
  visibleText: 'Short.',
  wordCount: 6,
  canonicalUrl: null,
  robotsMeta: 'noindex, nofollow',
  faviconUrl: null,
  htmlLang: null,
  viewport: null,
  openGraph: {},
  twitterCard: {},
  inputs: [{ hasLabel: false, type: 'email' }],
};

const byId = (checks: MetricCheck[], id: MetricCheck['id']): MetricCheck => {
  const found = checks.find((check) => check.id === id);
  if (!found) throw new Error(`Expected a check with id "${id}"`);
  return found;
};

describe('MetricsService', () => {
  it('grades every check green for a well-optimised page', () => {
    const checks = metricsService.runChecks(perfectPage, fetchResult);

    expect(checks.length).toBeGreaterThan(0);
    const failures = checks.filter((check) => check.status !== 'green');
    expect(failures.map((check) => `${check.id}: ${check.message}`)).toEqual([]);
  });

  it('flags problems across every category for a broken page', () => {
    const checks = metricsService.runChecks(brokenPage, {
      ...fetchResult,
      status: 404,
      durationMs: 4200,
    });

    expect(byId(checks, 'title').status).toBe('red');
    expect(byId(checks, 'metaDescription').status).toBe('red');
    expect(byId(checks, 'h1').status).toBe('red');
    expect(byId(checks, 'wordCount').status).toBe('red');
    expect(byId(checks, 'canonical').status).toBe('red');
    expect(byId(checks, 'robotsMeta').status).toBe('red');
    expect(byId(checks, 'httpStatus').status).toBe('red');
    expect(byId(checks, 'responseTime').status).toBe('red');
    expect(byId(checks, 'openGraph').status).toBe('red');
    expect(byId(checks, 'imageAlt').status).toBe('red');
    expect(byId(checks, 'htmlLang').status).toBe('red');
    expect(byId(checks, 'viewport').status).toBe('red');
    expect(byId(checks, 'inputLabels').status).toBe('red');
  });

  it('gives every check a recommendation and a recommended value', () => {
    // The UI renders all three on each card, so none may be blank.
    for (const check of metricsService.runChecks(brokenPage, fetchResult)) {
      expect(check.recommendation.length, `${check.id} recommendation`).toBeGreaterThan(0);
      expect(check.recommendedValue.length, `${check.id} recommendedValue`).toBeGreaterThan(0);
      expect(check.displayValue.length, `${check.id} displayValue`).toBeGreaterThan(0);
    }
  });

  it('assigns critical priority to the most damaging failures', () => {
    const checks = metricsService.runChecks(brokenPage, fetchResult);

    expect(byId(checks, 'title').priority).toBe('critical');
    expect(byId(checks, 'metaDescription').priority).toBe('critical');
    expect(byId(checks, 'robotsMeta').priority).toBe('critical');
  });

  it('produces unique check ids', () => {
    const ids = metricsService.runChecks(perfectPage, fetchResult).map((check) => check.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('extracts display details alongside the graded checks', () => {
    const details = metricsService.extractDetails(brokenPage);

    expect(details).toMatchObject({
      title: null,
      wordCount: 6,
      imageCount: 5,
      imagesMissingAlt: 5,
      linkCount: 1,
      internalLinkCount: 1,
      externalLinkCount: 0,
    });
  });
});
