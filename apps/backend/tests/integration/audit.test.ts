import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Audit API Integration', () => {
  it('GET /health returns 200 with status ok and timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('POST /api/v1/audit returns 400 VALIDATION_ERROR for empty body or missing URL', async () => {
    const res = await request(app)
      .post('/api/v1/audit')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.meta.requestId).toBeDefined();
  });

  it('POST /api/v1/audit returns 400 VALIDATION_ERROR for invalid URL string', async () => {
    const res = await request(app)
      .post('/api/v1/audit')
      .send({ url: 'http://' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/audit returns 400 VALIDATION_ERROR for localhost / private IP (SSRF protection)', async () => {
    const res = await request(app)
      .post('/api/v1/audit')
      .send({ url: 'http://localhost:3000' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /unknown-route returns 404 NOT_FOUND with standard error envelope', async () => {
    const res = await request(app).get('/api/v1/unknown');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.meta.requestId).toBeDefined();
  });
});
