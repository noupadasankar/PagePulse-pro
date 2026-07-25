import { Request, Response, NextFunction } from 'express';
import { AuditRequestSchema, LinkCheckRequestSchema } from '@pagepulse/shared-types';
import { AuditService } from '../services/AuditService';
import { FetchService } from '../services/FetchService';
import { ParserService } from '../services/ParserService';
import { MetricsService } from '../services/MetricsService';
import { ScoringService } from '../services/ScoringService';
import { LinkCheckService } from '../services/LinkCheckService';
import { ResponseBuilder } from '../utils/responseBuilder';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS } from '../constants';
import { validateAndNormalizeUrl } from '../validators/urlValidator';
import { ValidationError } from '../errors';

export class AuditController {
  private auditService: AuditService;
  private fetchService: FetchService;
  private parserService: ParserService;
  private linkCheckService: LinkCheckService;

  constructor(auditService?: AuditService) {
    this.fetchService = new FetchService();
    this.parserService = new ParserService();
    this.linkCheckService = new LinkCheckService();

    this.auditService =
      auditService ??
      new AuditService(
        this.fetchService,
        this.parserService,
        new MetricsService(),
        new ScoringService()
      );
  }

  /** POST /api/v1/audit — run a full audit. */
  public audit = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
    const startedAt = Date.now();
    const requestId = req.id || 'unknown';

    try {
      const parsed = AuditRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        const issues = parsed.error.issues.map((issue) => issue.message).join('; ');
        return ResponseBuilder.validationError(res, issues, parsed.error.format(), requestId);
      }

      const result = await this.auditService.audit(parsed.data.url);

      return ResponseBuilder.success(res, result, HTTP_STATUS.OK, {
        requestId,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      return next(error);
    }
  };

  /** GET /api/v1/audit/:id — retrieve a stored result, for share links. */
  public getById = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
    const requestId = req.id || 'unknown';

    try {
      const result = this.auditService.getById(req.params.id);

      if (!result) {
        throw new AppError(
          'Audit not found or expired',
          'NOT_FOUND',
          HTTP_STATUS.NOT_FOUND,
          'No stored audit matches this ID. Results are retained for one hour.',
          'Run a new audit to generate a fresh report.'
        );
      }

      return ResponseBuilder.success(res, result, HTTP_STATUS.OK, { requestId });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * POST /api/v1/audit/links — probe the links on a page.
   *
   * Separate from the main audit because it makes up to 25 extra requests,
   * which would push a fast audit past the 5-second target.
   */
  public checkLinks = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
    const startedAt = Date.now();
    const requestId = req.id || 'unknown';

    try {
      const parsed = LinkCheckRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        const issues = parsed.error.issues.map((issue) => issue.message).join('; ');
        return ResponseBuilder.validationError(res, issues, parsed.error.format(), requestId);
      }

      const validation = validateAndNormalizeUrl(parsed.data.url);
      if (!validation.isValid || !validation.normalizedUrl) {
        throw new ValidationError(
          validation.error || 'Invalid or prohibited URL',
          undefined,
          undefined,
          { code: validation.code }
        );
      }

      const fetchResult = await this.fetchService.fetchHtml(validation.normalizedUrl);
      const page = this.parserService.parse(fetchResult.html, fetchResult.finalUrl);
      const report = await this.linkCheckService.checkLinks(page.links);

      return ResponseBuilder.success(res, report, HTTP_STATUS.OK, {
        requestId,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      return next(error);
    }
  };
}
