import axios from 'axios';
import type { LinkCheck, LinkCheckReport, LinkStatus } from '@pagepulse/shared-types';
import type { ParsedLink } from '../types/audit.types';
import { validateAndNormalizeUrl } from '../validators/urlValidator';
import { USER_AGENT } from '../constants';

/** Cap on links probed per request, to bound wall-clock time. */
const MAX_LINKS_CHECKED = 25;

/** Simultaneous in-flight requests. */
const CONCURRENCY = 6;

/** Per-link timeout. Short: a slow link is a bad link from a UX standpoint. */
const LINK_TIMEOUT_MS = 5000;

/**
 * Probes links found on an audited page.
 *
 * Runs behind its own endpoint rather than inside the main audit because it
 * makes up to 25 extra network calls and would push a 1-second audit past the
 * product's 5-second promise.
 *
 * Every URL is re-validated through `validateAndNormalizeUrl` before being
 * fetched. Links come from third-party HTML, so without that check this
 * endpoint would be an SSRF primitive pointed at the internal network.
 */
export class LinkCheckService {
  async checkLinks(links: ParsedLink[]): Promise<LinkCheckReport> {
    const targets = links.slice(0, MAX_LINKS_CHECKED);
    const results = await this.runWithConcurrency(targets, (link) => this.checkOne(link));

    return {
      totalFound: links.length,
      checked: results.length,
      broken: results.filter((result) => result.status === 'broken').length,
      truncated: links.length > targets.length,
      links: results,
    };
  }

  private async checkOne(link: ParsedLink): Promise<LinkCheck> {
    const base = {
      url: link.href,
      text: link.text,
      isInternal: link.isInternal,
    };

    // Refuse anything pointing at localhost, private ranges, or a non-HTTP
    // scheme before a request is ever made.
    const validation = validateAndNormalizeUrl(link.href);
    if (!validation.isValid || !validation.normalizedUrl) {
      return {
        ...base,
        status: 'blocked',
        httpStatus: null,
        responseTimeMs: null,
        message: validation.error ?? 'URL is not permitted',
      };
    }

    const startedAt = Date.now();
    try {
      // HEAD first — it avoids downloading bodies. Some servers reject or
      // mishandle HEAD, so fall back to a ranged GET before calling it broken.
      const response = await this.request(validation.normalizedUrl, 'HEAD').catch((error: unknown) => {
        if (isMethodUnsupported(error)) return this.request(validation.normalizedUrl!, 'GET');
        throw error;
      });

      return {
        ...base,
        status: statusFromCode(response.status),
        httpStatus: response.status,
        responseTimeMs: Date.now() - startedAt,
        message: response.status >= 400 ? `Server returned ${response.status}` : undefined,
      };
    } catch (error) {
      return {
        ...base,
        ...this.describeFailure(error),
        responseTimeMs: Date.now() - startedAt,
      };
    }
  }

  private request(url: string, method: 'HEAD' | 'GET') {
    return axios.request({
      url,
      method,
      timeout: LINK_TIMEOUT_MS,
      maxRedirects: 5,
      // Resolve on 4xx/5xx so they're reported as results, not exceptions.
      validateStatus: () => true,
      headers: {
        'User-Agent': USER_AGENT,
        // Ask for only the first byte; we need the status, not the body.
        ...(method === 'GET' ? { Range: 'bytes=0-0' } : {}),
      },
    });
  }

  private describeFailure(error: unknown): Pick<LinkCheck, 'status' | 'httpStatus' | 'message'> {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { status: 'timeout', httpStatus: null, message: `No response within ${LINK_TIMEOUT_MS / 1000}s` };
      }
      if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
        return { status: 'broken', httpStatus: null, message: 'Domain could not be resolved' };
      }
      if (error.code === 'ECONNREFUSED') {
        return { status: 'broken', httpStatus: null, message: 'Connection refused' };
      }
      return { status: 'broken', httpStatus: null, message: error.message };
    }

    return { status: 'broken', httpStatus: null, message: 'Request failed' };
  }

  /**
   * Worker-pool map: keeps exactly `CONCURRENCY` requests in flight rather than
   * firing all 25 at once, which would hammer the target server.
   */
  private async runWithConcurrency<T, R>(items: T[], task: (item: T) => Promise<R>): Promise<R[]> {
    const results = new Array<R>(items.length);
    let nextIndex = 0;

    const worker = async (): Promise<void> => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await task(items[index]);
      }
    };

    const workerCount = Math.min(CONCURRENCY, items.length);
    await Promise.all(Array.from({ length: workerCount }, worker));

    return results;
  }
}

function statusFromCode(code: number): LinkStatus {
  if (code >= 400) return 'broken';
  if (code >= 300) return 'redirect';
  return 'ok';
}

/** True when a server rejected the HEAD method specifically. */
function isMethodUnsupported(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 405 || status === 501;
}
