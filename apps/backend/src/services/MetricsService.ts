import type { AuditDetails, MetricCheck } from '@pagepulse/shared-types';
import type { FetchResult, ParsedHtml } from '../types/audit.types';
import {
  analyzeAccessibility,
  analyzeContent,
  analyzeIndexability,
  analyzeMeta,
  analyzeSocial,
} from './analyzers';

/**
 * Runs every analyzer over a parsed page.
 *
 * Composition only — all grading logic lives in the individual analyzers under
 * ./analyzers, which keeps each one small and independently testable.
 */
export class MetricsService {
  runChecks(parsed: ParsedHtml, fetchResult: FetchResult): MetricCheck[] {
    return [
      ...analyzeMeta(parsed),
      ...analyzeContent(parsed),
      ...analyzeIndexability(parsed, fetchResult),
      ...analyzeSocial(parsed),
      ...analyzeAccessibility(parsed),
    ];
  }

  /** Raw extracted facts, kept alongside the graded checks for display/export. */
  extractDetails(parsed: ParsedHtml): AuditDetails {
    return {
      title: parsed.title,
      metaDescription: parsed.metaDescription,
      h1s: parsed.h1s,
      headings: parsed.headings,
      canonicalUrl: parsed.canonicalUrl,
      robotsMeta: parsed.robotsMeta,
      faviconUrl: parsed.faviconUrl,
      htmlLang: parsed.htmlLang,
      viewport: parsed.viewport,
      wordCount: parsed.wordCount,
      imageCount: parsed.images.length,
      imagesMissingAlt: parsed.images.filter((image) => image.missingAlt).length,
      linkCount: parsed.links.length,
      internalLinkCount: parsed.links.filter((link) => link.isInternal).length,
      externalLinkCount: parsed.links.filter((link) => !link.isInternal).length,
      openGraph: parsed.openGraph,
      twitterCard: parsed.twitterCard,
    };
  }
}
