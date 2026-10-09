import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('GET /api/v1/health', () => {
  it('should return 200 OK with service health details', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status', 'ok');
    expect(response.body.data).toHaveProperty('service', 'ethereum-fraud-detection-api');
    expect(response.body.data).toHaveProperty('version');
    expect(response.body.data).toHaveProperty('uptimeSeconds');
    expect(response.body.data).toHaveProperty('timestamp');
  });

  it('should include security headers from Helmet', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(response.headers).toHaveProperty('x-dns-prefetch-control');
  });

  it('should return 404 for nonexistent route', async () => {
    const response = await request(app).get('/api/v1/nonexistent-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'NOT_FOUND');
  });
});
