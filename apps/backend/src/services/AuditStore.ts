import type { AuditResult } from '@pagepulse/shared-types';

/** Results live for one hour, per FR-05 in the build guide. */
const TTL_MS = 60 * 60 * 1000;

/** Hard cap on retained results; oldest are evicted first. */
const MAX_ENTRIES = 1000;

/** Default cleanup interval (every 5 minutes). */
const DEFAULT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

interface StoredEntry {
  result: AuditResult;
  expiresAt: number;
}

/**
 * In-memory store backing share links (`GET /api/v1/audit/:id`).
 *
 * Deliberately not a database: results are disposable and the spec asks only
 * for a short-lived cache. A Map preserves insertion order, so evicting the
 * oldest entry is just deleting the first key.
 *
 * Expiry is lazy — checked on read rather than by a timer — so an idle process
 * does no work. An optional periodic cleanup interval can be enabled for
 * long-running processes to prevent memory buildup between accesses.
 */
export class AuditStore {
  private entries = new Map<string, StoredEntry>();
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    private readonly ttlMs: number = TTL_MS,
    private readonly maxEntries: number = MAX_ENTRIES,
    private readonly cleanupIntervalMs: number = 0
  ) {
    if (cleanupIntervalMs > 0) {
      this.cleanupTimer = setInterval(() => this.evictExpired(), cleanupIntervalMs);
      // Don't prevent process exit
      this.cleanupTimer.unref?.();
    }
  }

  set(result: AuditResult): void {
    // Re-inserting must refresh position, so delete any existing key first.
    this.entries.delete(result.id);
    this.entries.set(result.id, { result, expiresAt: Date.now() + this.ttlMs });

    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }

  /** Returns the result, or null if unknown or expired. */
  get(id: string): AuditResult | null {
    const entry = this.entries.get(id);
    if (!entry) return null;

    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(id);
      return null;
    }

    return entry.result;
  }

  /** Live entry count, excluding any that have expired. */
  get size(): number {
    this.evictExpired();
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }

  /** Stops the periodic cleanup timer if running. */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [id, entry] of this.entries) {
      if (now >= entry.expiresAt) this.entries.delete(id);
    }
  }
}

/** Shared instance used by the request path. */
export const auditStore = new AuditStore(
  TTL_MS,
  MAX_ENTRIES,
  process.env.NODE_ENV === 'production' ? DEFAULT_CLEANUP_INTERVAL_MS : 0
);
