import axios from 'axios';
import http from 'http';
import https from 'https';
import type { FetchResult } from '../types/audit.types';
import { TimeoutError, NetworkError, NonHtmlError } from '../errors';
import { config } from '../config/env';
import { MAX_REDIRECTS, USER_AGENT } from '../constants';

export class FetchService {
  // Keep-alive agents let repeat audits of the same host reuse connections.
  private httpAgent = new http.Agent({ keepAlive: true });
  private httpsAgent = new https.Agent({ keepAlive: true });

  async fetchHtml(url: string): Promise<FetchResult> {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: config.REQUEST_TIMEOUT,
        maxRedirects: MAX_REDIRECTS,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        httpAgent: this.httpAgent,
        httpsAgent: this.httpsAgent,
        // Streamed so an oversized body can be aborted mid-download rather than
        // buffered in full before we notice.
        responseType: 'stream',
      });

      const contentType = response.headers['content-type']?.toString() || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        response.data.destroy();
        throw new NonHtmlError(`Invalid Content-Type: ${contentType}`);
      }

      let html = '';
      let downloadedBytes = 0;

      for await (const chunk of response.data) {
        downloadedBytes += chunk.length;
        if (downloadedBytes > config.MAX_HTML_SIZE) {
          response.data.destroy();
          throw new NetworkError(
            `Response exceeded the maximum size of ${config.MAX_HTML_SIZE} bytes`
          );
        }
        html += chunk.toString('utf-8');
      }

      return {
        html,
        status: response.status,
        headers: response.headers as Record<string, string>,
        durationMs: Date.now() - startTime,
        finalUrl: response.request?.res?.responseUrl || url,
        contentType,
      };
    } catch (error) {
      throw this.toDomainError(error);
    }
  }

  /** Maps transport failures onto the error types the API contract exposes. */
  private toDomainError(error: unknown): Error {
    if (error instanceof NonHtmlError || error instanceof NetworkError || error instanceof TimeoutError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      switch (error.code) {
        case 'ECONNABORTED':
        case 'ETIMEDOUT':
          return new TimeoutError('The target server took too long to respond');
        case 'ENOTFOUND':
        case 'EAI_AGAIN':
          return new NetworkError('Domain could not be resolved');
        case 'ECONNREFUSED':
        case 'ENETUNREACH':
          return new NetworkError('Connection refused by the target server');
        case 'ERR_FR_TOO_MANY_REDIRECTS':
          return new NetworkError('Too many redirects');
        default:
          break;
      }

      if (/SSL|TLS|CERT/i.test(error.message)) {
        return new NetworkError('SSL/TLS handshake failed');
      }
      if (/too many redirects/i.test(error.message)) {
        return new NetworkError('Too many redirects');
      }
      if (error.response) {
        return new NetworkError(`Target server returned HTTP ${error.response.status}`);
      }

      return new NetworkError(`Network error: ${error.message}`);
    }

    return new NetworkError('An unexpected error occurred while fetching the page');
  }
}
