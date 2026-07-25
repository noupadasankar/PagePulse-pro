import { describe, it, expect } from 'vitest';
import { validateAndNormalizeUrl } from '../../src/validators/urlValidator';

describe('urlValidator', () => {
  it('validates and normalizes valid HTTP/HTTPS URLs', () => {
    const res = validateAndNormalizeUrl('https://example.com');
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe('https://example.com/');
  });

  it('normalizes missing scheme by prepending https://', () => {
    const res = validateAndNormalizeUrl('example.com/test');
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe('https://example.com/test');
  });

  it('blocks localhost', () => {
    const res = validateAndNormalizeUrl('http://localhost');
    expect(res.isValid).toBe(false);
    expect(res.code).toBe('SSRF_PROTECTION');
  });

  it('blocks private IPv4/IPv6 addresses', () => {
    expect(validateAndNormalizeUrl('http://127.0.0.1').isValid).toBe(false);
    expect(validateAndNormalizeUrl('http://::1').isValid).toBe(false);
    expect(validateAndNormalizeUrl('http://192.168.1.1').isValid).toBe(false);
    expect(validateAndNormalizeUrl('http://10.0.0.1').isValid).toBe(false);
    expect(validateAndNormalizeUrl('http://172.16.0.1').isValid).toBe(false);
    expect(validateAndNormalizeUrl('http://169.254.169.254').isValid).toBe(false);
  });

  it('blocks javascript/ftp/file schemes', () => {
    expect(validateAndNormalizeUrl('javascript:alert(1)').isValid).toBe(false);
    expect(validateAndNormalizeUrl('ftp://example.com').isValid).toBe(false);
    expect(validateAndNormalizeUrl('file:///etc/passwd').isValid).toBe(false);
  });

  it('handles malformed URLs gracefully', () => {
    const res = validateAndNormalizeUrl('http://');
    expect(res.isValid).toBe(false);
  });
});
