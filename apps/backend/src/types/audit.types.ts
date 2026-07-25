import type { AuditDetails, AuditResult, MetricCheck } from '@pagepulse/shared-types';

export interface FetchResult {
  html: string;
  status: number;
  headers: Record<string, string>;
  durationMs: number;
  finalUrl: string;
  contentType: string;
}

export interface ParsedImage {
  src: string;
  alt: string | null;
  missingAlt: boolean;
}

export interface ParsedLink {
  href: string;
  text: string;
  isInternal: boolean;
}

export interface ParsedHeading {
  level: number;
  text: string;
}

/**
 * Everything the analyzers need, extracted from the HTML in a single pass.
 *
 * Analyzers are pure functions over this structure, which keeps them trivially
 * unit-testable with no network and no DOM.
 */
export interface ParsedHtml {
  title: string | null;
  metaDescription: string | null;
  h1s: string[];
  headings: ParsedHeading[];
  images: ParsedImage[];
  links: ParsedLink[];
  visibleText: string;
  wordCount: number;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  faviconUrl: string | null;
  htmlLang: string | null;
  viewport: string | null;
  /** og:* tags, keyed without the "og:" prefix. */
  openGraph: Record<string, string>;
  /** twitter:* tags, keyed without the "twitter:" prefix. */
  twitterCard: Record<string, string>;
  /** Inputs that require a label, and whether each has one. */
  inputs: { hasLabel: boolean; type: string }[];
}

/** A single check: parsed page in, graded result out. Pure. */
export type Analyzer = (parsed: ParsedHtml, fetchResult: FetchResult) => MetricCheck;

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
  code?: string;
}

// Re-exported so backend modules import the wire contract from one place.
export type { AuditDetails, AuditResult, MetricCheck };
