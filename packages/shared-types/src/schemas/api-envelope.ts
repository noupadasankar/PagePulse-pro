import { z } from 'zod';

/**
 * Error codes the API can return. Mirrors the `code` on each AppError subclass
 * in apps/backend/src/errors/.
 */
export const ErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'NON_HTML_CONTENT',
  'PARSER_ERROR',
  'RATE_LIMIT_EXCEEDED',
  'NOT_FOUND',
  'INTERNAL_ERROR',
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ApiMetaSchema = z.object({
  requestId: z.string(),
  timestamp: z.string(),
  durationMs: z.number().optional(),
});
export type ApiMeta = z.infer<typeof ApiMetaSchema>;

export const ApiErrorSchema = z.object({
  /** Unknown codes are tolerated so an older client can still show the message. */
  code: z.string(),
  /** User-facing. Safe to render directly. */
  message: z.string(),
  /** Diagnostic detail; not intended for end users. */
  developerMessage: z.string().optional(),
  /** Actionable next step, e.g. "Check the URL is reachable." */
  recoveryAdvice: z.string().optional(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: ApiErrorSchema,
  meta: ApiMetaSchema,
});
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

/**
 * Builds a success-envelope schema around a payload schema.
 *
 * A function rather than a static schema because the envelope is generic over
 * `data`; this lets callers parse a fully-typed response in one step, e.g.
 * `apiSuccessEnvelope(AuditResultSchema).parse(json)`.
 */
export function apiSuccessEnvelope<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: ApiMetaSchema,
  });
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}
