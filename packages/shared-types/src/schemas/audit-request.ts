import { z } from 'zod';

/**
 * Audit request body.
 *
 * Deliberately looser than `z.string().url()`: the backend accepts bare hosts
 * like "example.com" and normalizes them (prepending https://) in
 * `validateAndNormalizeUrl`. Rejecting them here would break that affordance.
 */
export const AuditRequestSchema = z.object({
  url: z
    .string({ required_error: 'URL is required', invalid_type_error: 'URL must be a string' })
    .min(1, 'URL cannot be empty')
    .max(2048, 'URL must be under 2048 characters'),
});

export type AuditRequest = z.infer<typeof AuditRequestSchema>;
