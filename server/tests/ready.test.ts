import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('GET /api/v1/ready', () => {
  it('should return readiness payload indicating database status', async () => {
    const response = await request(app).get('/api/v1/ready');

    // In unit test without connected Mongo, ready status is false with 503 or 200 depending on state
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('service', 'ethereum-fraud-detection-api');
    expect(response.body.data).toHaveProperty('database');
    expect(response.body.data.database).toHaveProperty('status');
    expect(response.body.data.database).toHaveProperty('readyState');
  });
});
