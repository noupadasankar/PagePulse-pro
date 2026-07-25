import { UrlValidationResult } from '../types/audit.types';
import * as net from 'net';

export function validateAndNormalizeUrl(inputUrl: string): UrlValidationResult {
  try {
    let normalized = inputUrl.trim();

    // Check if the input already specifies a protocol scheme (e.g. ftp://, javascript:, file://, http://, https://)
    const schemeMatch = normalized.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
    if (schemeMatch) {
      const scheme = schemeMatch[1].toLowerCase();
      if (scheme !== 'http' && scheme !== 'https') {
        return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed.', code: 'INVALID_PROTOCOL' };
      }
    } else {
      // Prepend https:// if no scheme specified
      normalized = `https://${normalized}`;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(normalized);
    } catch {
      return { isValid: false, error: 'Malformed URL provided.', code: 'INVALID_URL' };
    }

    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed.', code: 'INVALID_PROTOCOL' };
    }

    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname || hostname === '') {
      return { isValid: false, error: 'Invalid hostname.', code: 'INVALID_HOSTNAME' };
    }

    // SSRF: Hostname blocking
    if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { isValid: false, error: 'Access to local or internal hostnames is not allowed.', code: 'SSRF_PROTECTION' };
    }

    // SSRF: IP range blocking (IPv4 & IPv6)
    const isIp = net.isIP(hostname);
    if (isIp) {
      if (
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname === '::1' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('169.254.')
      ) {
        return { isValid: false, error: 'Access to private or local IP addresses is not allowed.', code: 'SSRF_PROTECTION' };
      }

      if (isIp === 4) {
        const parts = hostname.split('.').map(Number);
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
          return { isValid: false, error: 'Access to private or local IP addresses is not allowed.', code: 'SSRF_PROTECTION' };
        }
      }
    }

    return { isValid: true, normalizedUrl: urlObj.toString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'URL validation failed';
    return { isValid: false, error: message, code: 'UNKNOWN_VALIDATION_ERROR' };
  }
}
