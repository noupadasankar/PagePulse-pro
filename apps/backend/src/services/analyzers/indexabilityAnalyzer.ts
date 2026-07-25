import type { MetricCheck } from '@pagepulse/shared-types';
import type { FetchResult, ParsedHtml } from '../../types/audit.types';
import { buildCheck, truncate } from './checkBuilder';

/**
 * Whether search engines can reach, crawl, and index this page — plus how fast
 * it responds. These carry the heaviest weight after meta tags: a page that
 * can't be indexed cannot rank no matter how good everything else is.
 */
export function analyzeIndexability(parsed: ParsedHtml, fetchResult: FetchResult): MetricCheck[] {
  return [
    analyzeRobotsMeta(parsed),
    analyzeCanonical(parsed, fetchResult),
    analyzeFavicon(parsed),
    analyzeHttpStatus(fetchResult),
    analyzeResponseTime(fetchResult),
  ];
}

function analyzeRobotsMeta(parsed: ParsedHtml): MetricCheck {
  const robots = parsed.robotsMeta;
  const directives = robots?.toLowerCase() ?? '';
  const isNoIndex = directives.includes('noindex');
  const isNoFollow = directives.includes('nofollow');

  if (isNoIndex) {
    return buildCheck({
      id: 'robotsMeta',
      label: 'Robots Meta',
      category: 'indexability',
      status: 'red',
      value: robots,
      displayValue: 'noindex',
      recommendedValue: 'index, follow',
      message: 'This page is explicitly blocked from search indexes.',
      recommendation:
        'Remove the "noindex" directive if this page should rank. As configured, search engines will not list it at all.',
      priority: 'critical',
      weight: 3,
    });
  }

  if (isNoFollow) {
    return buildCheck({
      id: 'robotsMeta',
      label: 'Robots Meta',
      category: 'indexability',
      status: 'amber',
      value: robots,
      displayValue: 'nofollow',
      recommendedValue: 'index, follow',
      message: 'This page is indexable, but its links are not followed.',
      recommendation:
        'Remove "nofollow" unless intentional. It stops link equity flowing to the pages you link to.',
      weight: 3,
    });
  }

  return buildCheck({
    id: 'robotsMeta',
    label: 'Robots Meta',
    category: 'indexability',
    status: 'green',
    value: robots,
    displayValue: robots ?? 'index, follow (default)',
    recommendedValue: 'index, follow',
    message: 'This page is open to search engine indexing.',
    recommendation: 'Page is indexable — no action needed.',
    weight: 3,
  });
}

function analyzeCanonical(parsed: ParsedHtml, fetchResult: FetchResult): MetricCheck {
  const canonical = parsed.canonicalUrl;

  if (!canonical) {
    return buildCheck({
      id: 'canonical',
      label: 'Canonical URL',
      category: 'indexability',
      status: 'red',
      value: null,
      displayValue: 'Missing',
      recommendedValue: 'Self-referencing canonical',
      message: 'This page declares no canonical URL.',
      recommendation:
        'Add <link rel="canonical" href="..."> pointing at this page. It consolidates ranking signals when the same content is reachable at several URLs.',
      priority: 'high',
      weight: 2,
    });
  }

  // A canonical pointing elsewhere is legitimate for syndicated content, but
  // it's worth surfacing: it hands ranking credit to the target URL.
  const isSelfReferencing = normalizeUrl(canonical) === normalizeUrl(fetchResult.finalUrl);

  if (!isSelfReferencing) {
    return buildCheck({
      id: 'canonical',
      label: 'Canonical URL',
      category: 'indexability',
      status: 'amber',
      value: canonical,
      displayValue: 'Points elsewhere',
      recommendedValue: 'Self-referencing canonical',
      message: `Canonical points to ${truncate(canonical, 60)}`,
      recommendation:
        'This page tells search engines to credit a different URL. Correct if this is the original; intentional if the content is syndicated.',
      weight: 2,
    });
  }

  return buildCheck({
    id: 'canonical',
    label: 'Canonical URL',
    category: 'indexability',
    status: 'green',
    value: canonical,
    displayValue: 'Self-referencing',
    recommendedValue: 'Self-referencing canonical',
    message: 'Canonical URL correctly points at this page.',
    recommendation: 'Correctly configured — duplicate-content risk is handled.',
    weight: 2,
  });
}

function analyzeFavicon(parsed: ParsedHtml): MetricCheck {
  const favicon = parsed.faviconUrl;

  if (!favicon) {
    return buildCheck({
      id: 'favicon',
      label: 'Favicon',
      category: 'indexability',
      status: 'amber',
      value: null,
      displayValue: 'Missing',
      recommendedValue: 'Declared <link rel="icon">',
      message: 'No favicon is declared in the HTML.',
      recommendation:
        'Add <link rel="icon" href="/favicon.ico">. Google shows favicons beside mobile search results, and browsers show them in tabs and bookmarks.',
      priority: 'low',
      weight: 1,
    });
  }

  return buildCheck({
    id: 'favicon',
    label: 'Favicon',
    category: 'indexability',
    status: 'green',
    value: favicon,
    displayValue: 'Present',
    recommendedValue: 'Declared <link rel="icon">',
    message: 'A favicon is declared.',
    recommendation: 'Favicon present — it will appear in tabs and mobile search results.',
    weight: 1,
  });
}

function analyzeHttpStatus(fetchResult: FetchResult): MetricCheck {
  const { status } = fetchResult;

  if (status >= 200 && status < 300) {
    return buildCheck({
      id: 'httpStatus',
      label: 'HTTP Status',
      category: 'indexability',
      status: 'green',
      value: status,
      displayValue: `${status} OK`,
      recommendedValue: '200 OK',
      message: 'The page returned a success status.',
      recommendation: 'Server responded normally.',
      weight: 2,
    });
  }

  // Redirects still serve content but cost a round trip and dilute signals.
  if (status >= 300 && status < 400) {
    return buildCheck({
      id: 'httpStatus',
      label: 'HTTP Status',
      category: 'indexability',
      status: 'amber',
      value: status,
      displayValue: `${status} Redirect`,
      recommendedValue: '200 OK',
      message: 'This URL redirects rather than serving content directly.',
      recommendation:
        'Link to the final destination directly. Each redirect adds latency and slightly dilutes ranking signals.',
      weight: 2,
    });
  }

  return buildCheck({
    id: 'httpStatus',
    label: 'HTTP Status',
    category: 'indexability',
    status: 'red',
    value: status,
    displayValue: `${status} Error`,
    recommendedValue: '200 OK',
    message: `The server returned HTTP ${status}.`,
    recommendation:
      'Search engines will not index a page that returns an error status. Fix the underlying server response.',
    priority: 'critical',
    weight: 2,
  });
}

function analyzeResponseTime(fetchResult: FetchResult): MetricCheck {
  const ms = fetchResult.durationMs;
  const displayValue = `${ms.toLocaleString('en-US')} ms`;

  if (ms < 1000) {
    return buildCheck({
      id: 'responseTime',
      label: 'Response Time',
      category: 'indexability',
      status: 'green',
      value: ms,
      displayValue,
      recommendedValue: 'Under 1,000 ms',
      message: 'The server responded quickly.',
      recommendation: 'Fast server response — good for both crawl budget and users.',
      weight: 1,
    });
  }

  if (ms <= 3000) {
    return buildCheck({
      id: 'responseTime',
      label: 'Response Time',
      category: 'indexability',
      status: 'amber',
      value: ms,
      displayValue,
      recommendedValue: 'Under 1,000 ms',
      message: 'The server was slow to respond.',
      recommendation:
        'Aim for under 1 second. Consider caching, a CDN, or reducing server-side work on this route.',
      weight: 1,
    });
  }

  return buildCheck({
    id: 'responseTime',
    label: 'Response Time',
    category: 'indexability',
    status: 'red',
    value: ms,
    displayValue,
    recommendedValue: 'Under 1,000 ms',
    message: 'The server took over 3 seconds to respond.',
    recommendation:
      'This is slow enough to hurt rankings and lose visitors. Investigate server performance, database queries, and caching.',
    priority: 'high',
    weight: 1,
  });
}

/** Compares URLs ignoring trailing slash and protocol differences. */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/$/, '');
    return `${parsed.host}${pathname}${parsed.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
