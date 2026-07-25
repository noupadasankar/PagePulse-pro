import * as crypto from 'crypto';
import type { AuditResult } from '@pagepulse/shared-types';
import { FetchService } from './FetchService';
import { ParserService } from './ParserService';
import { MetricsService } from './MetricsService';
import { ScoringService } from './ScoringService';
import { AuditStore, auditStore } from './AuditStore';
import { ValidationError } from '../errors';
import { validateAndNormalizeUrl } from '../validators/urlValidator';

/**
 * Orchestrates one audit: validate → fetch → parse → check → score → store.
 *
 * Each step is a separate injected service so the pipeline stays testable and
 * no single class owns both I/O and grading logic.
 */
export class AuditService {
  constructor(
    private fetchService: FetchService,
    private parserService: ParserService,
    private metricsService: MetricsService,
    private scoringService: ScoringService,
    private store: AuditStore = auditStore
  ) {}

  async audit(rawUrl: string): Promise<AuditResult> {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new ValidationError('URL parameter is required and must be a string');
    }

    const validation = validateAndNormalizeUrl(rawUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      throw new ValidationError(validation.error || 'Invalid or prohibited URL', undefined, undefined, {
        code: validation.code,
      });
    }

    const normalizedUrl = validation.normalizedUrl;
    const fetchResult = await this.fetchService.fetchHtml(normalizedUrl);
    const parsed = this.parserService.parse(fetchResult.html, fetchResult.finalUrl);

    const checks = this.metricsService.runChecks(parsed, fetchResult);

    const result: AuditResult = {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      finalUrl: fetchResult.finalUrl,
      httpStatus: fetchResult.status,
      responseTimeMs: fetchResult.durationMs,
      contentType: fetchResult.contentType,
      auditedAt: new Date().toISOString(),
      score: this.scoringService.calculateScore(checks),
      checks,
      details: this.metricsService.extractDetails(parsed),
    };

    // Retained so share links (GET /api/v1/audit/:id) can serve this result.
    this.store.set(result);

    return result;
  }

  /** Looks up a previously stored result. Null when unknown or expired. */
  getById(id: string): AuditResult | null {
    return this.store.get(id);
  }
}
