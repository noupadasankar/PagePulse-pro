# API Documentation

## Endpoint: POST /api/audit
- **Method**: POST
- **Content-Type**: application/json
- **Headers**: `X-Request-ID` (optional, generated if absent)

### Request Body
```json
{ "url": "https://example.com" }
```

### Validation Rules
- `url`: required, string, valid HTTP/HTTPS URL, max 2048 chars, no private IPs, no blocked schemes

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "auditedAt": "2026-07-25T10:00:00Z",
    "metrics": {
      "title": { "exists": true, "value": "Example Domain", "length": 14, "score": "green" },
      "metaDescription": { "exists": true, "value": "...", "length": 120, "score": "green" },
      "h1Count": { "count": 1, "score": "green" },
      "imagesMissingAlt": { "total": 5, "missingAlt": 2, "score": "amber" },
      "wordCount": { "count": 450, "score": "green" },
      "canonicalUrl": { "exists": true, "value": "https://example.com" },
      "robotsMeta": { "exists": true, "content": "index, follow", "isIndexable": true }
    },
    "id": "abc123"
  },
  "meta": { "requestId": "uuid", "timestamp": "ISO8601", "durationMs": 1234 }
}
```

### Error Responses
- `VALIDATION_ERROR` (400): Invalid request format or missing required fields.
- `INVALID_URL` (400): URL is malformed or not a valid http/https URL.
- `BLOCKED_URL` (400): URL resolves to localhost, a private IP, or a blocked scheme.
- `FETCH_TIMEOUT` (408): The target server took too long to respond (connect or read).
- `DNS_FAILURE` (502): Could not resolve the hostname.
- `SSL_ERROR` (502): Certificate validation failed for the target URL.
- `REDIRECT_LOOP` (502): Too many redirects encountered (>5).
- `NOT_FOUND` (502): Target server returned a 404 Not Found.
- `UPSTREAM_ERROR` (502): Target server returned an error status (e.g., 500, 502, 503).
- `FORBIDDEN` (502): Target server returned a 403 Forbidden.
- `RATE_LIMITED` (429): Too many requests from this IP.
- `CONTENT_TOO_LARGE` (413): The target page exceeds the maximum allowed size (10MB).
- `NOT_HTML` (415): The target URL does not point to an HTML document.
- `INTERNAL_ERROR` (500): An unexpected error occurred on the server.

Example Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid URL format"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}
```

### Rate Limiting
- 30 requests per minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Returns 429 response when exceeded

### Timeout Rules
- Connect timeout: 10 seconds
- Response timeout: 30 seconds
- Max redirects: 5
- Max response size: 10MB

### Health Check: GET /health
- Response:
```json
{ "status": "ok", "uptime": 12345.67, "timestamp": "2026-07-25T11:04:25Z" }
```

### Shareable Results: GET /api/audit/:id
- Returns stored audit result
- 404 if not found or expired
- TTL: 24 hours

### Examples

**Audit Request**
```bash
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Health Check**
```bash
curl http://localhost:3000/health
```

**Fetch Stored Result**
```bash
curl http://localhost:3000/api/audit/abc123
```
