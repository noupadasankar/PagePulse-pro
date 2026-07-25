/**
 * The audit contract, shared by the Express backend and the Next.js frontend.
 *
 * This package is the single source of truth: both apps import these schemas,
 * so a change to the API shape becomes a compile error on both sides rather
 * than a runtime surprise.
 */
export * from './schemas/audit-request';
export * from './schemas/audit-metrics';
export * from './schemas/audit-score';
export * from './schemas/audit-result';
export * from './schemas/api-envelope';
export * from './schemas/link-check';
