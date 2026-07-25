import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { AuditResult } from '@pagepulse/shared-types';
import { AuditStore } from '../../src/services/AuditStore';

/** Minimal stored result — the store only ever reads `id`. */
function auditResult(id: string): AuditResult {
  return {
    id,
    url: `https://example.com/${id}`,
    finalUrl: `https://example.com/${id}`,
    httpStatus: 200,
    responseTimeMs: 100,
    contentType: 'text/html',
    auditedAt: '2026-07-25T00:00:00.000Z',
    score: {
      overall: 80,
      grade: 'B',
      label: 'Good',
      categories: [],
      passed: 1,
      warnings: 0,
      failed: 0,
    },
    checks: [],
    details: {
      title: null,
      metaDescription: null,
      h1s: [],
      headings: [],
      canonicalUrl: null,
      robotsMeta: null,
      faviconUrl: null,
      htmlLang: null,
      viewport: null,
      wordCount: 0,
      imageCount: 0,
      imagesMissingAlt: 0,
      linkCount: 0,
      internalLinkCount: 0,
      externalLinkCount: 0,
      openGraph: {},
      twitterCard: {},
    },
  };
}

const ONE_HOUR_MS = 60 * 60 * 1000;

describe('AuditStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a stored result by id', () => {
    const store = new AuditStore();
    store.set(auditResult('abc'));

    expect(store.get('abc')?.id).toBe('abc');
  });

  it('returns null for an unknown id', () => {
    expect(new AuditStore().get('never-stored')).toBeNull();
  });

  it('keeps a result until the TTL elapses', () => {
    const store = new AuditStore();
    store.set(auditResult('abc'));

    vi.advanceTimersByTime(ONE_HOUR_MS - 1000);

    expect(store.get('abc')).not.toBeNull();
  });

  it('expires a result once the TTL has elapsed', () => {
    const store = new AuditStore();
    store.set(auditResult('abc'));

    vi.advanceTimersByTime(ONE_HOUR_MS + 1);

    expect(store.get('abc')).toBeNull();
  });

  it('drops expired entries from the size count', () => {
    const store = new AuditStore();
    store.set(auditResult('a'));
    store.set(auditResult('b'));
    expect(store.size).toBe(2);

    vi.advanceTimersByTime(ONE_HOUR_MS + 1);

    expect(store.size).toBe(0);
  });

  it('evicts the oldest entry once capacity is exceeded', () => {
    const store = new AuditStore(ONE_HOUR_MS, 3);
    store.set(auditResult('first'));
    store.set(auditResult('second'));
    store.set(auditResult('third'));
    store.set(auditResult('fourth'));

    expect(store.size).toBe(3);
    expect(store.get('first')).toBeNull();
    expect(store.get('fourth')?.id).toBe('fourth');
  });

  it('refreshes an entry position when the same id is stored again', () => {
    const store = new AuditStore(ONE_HOUR_MS, 2);
    store.set(auditResult('a'));
    store.set(auditResult('b'));

    // Re-storing 'a' makes 'b' the oldest, so 'b' is evicted next.
    store.set(auditResult('a'));
    store.set(auditResult('c'));

    expect(store.get('a')?.id).toBe('a');
    expect(store.get('b')).toBeNull();
    expect(store.get('c')?.id).toBe('c');
  });

  it('resets the TTL when an entry is re-stored', () => {
    const store = new AuditStore();
    store.set(auditResult('abc'));

    vi.advanceTimersByTime(ONE_HOUR_MS - 1000);
    store.set(auditResult('abc'));
    vi.advanceTimersByTime(ONE_HOUR_MS - 1000);

    expect(store.get('abc')).not.toBeNull();
  });

  it('empties on clear', () => {
    const store = new AuditStore();
    store.set(auditResult('abc'));
    store.clear();

    expect(store.size).toBe(0);
    expect(store.get('abc')).toBeNull();
  });
});
