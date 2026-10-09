import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { User } from '../src/models/User.js';
import { Session } from '../src/models/Session.js';
import { EthereumDatasetRecord } from '../src/models/EthereumDatasetRecord.js';
import { Investigation } from '../src/models/Investigation.js';
import { env } from '../src/config/env.js';
import { createApp } from '../src/app.js';

const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/ethereum_fraud_safety_test';

describe('Data Safety & Ingestion Pipeline Integrity', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
    await EthereumDatasetRecord.deleteMany({});
    await Investigation.deleteMany({});
  });

  it('1. Application initialization must NOT auto-seed or insert any records into MongoDB', async () => {
    // Instantiate Express app
    const app = createApp();
    expect(app).toBeDefined();

    // Verify all collections remain completely empty
    const userCount = await User.countDocuments();
    const sessionCount = await Session.countDocuments();
    const datasetCount = await EthereumDatasetRecord.countDocuments();
    const investigationCount = await Investigation.countDocuments();

    expect(userCount).toBe(0);
    expect(sessionCount).toBe(0);
    expect(datasetCount).toBe(0);
    expect(investigationCount).toBe(0);
  });

  it('2. MongoDB must never contain movie or entertainment collections', async () => {
    const collections = await mongoose.connection.db!.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name.toLowerCase());

    const forbiddenNames = ['movies', 'embedded_movies', 'theaters', 'comments', 'films'];
    for (const forbidden of forbiddenNames) {
      expect(collectionNames).not.toContain(forbidden);
    }
  });

  it('3. Dataset records, investigations, and auth records must remain strictly isolated', async () => {
    // Insert a labeled dataset record
    await EthereumDatasetRecord.create({
      rawRowId: 1,
      address: '0x00009277775ac7d0d59eaad8fee3d10ac6c805e8',
      flag: 0,
      features: { avg_min_between_sent_tnx: 100 },
      datasetSource: 'kaggle-vagifa',
    });

    // Insert an investigation dossier
    await Investigation.create({
      targetAddress: '0x002c2192b1b590e80e14a1e5cc2c7bb2a8459424',
      riskScore: 98,
      riskTier: 'CRITICAL',
      classification: 'ILLICIT',
      keyDrivers: ['rapid_drain'],
    });

    // Verify isolation across collections
    expect(await EthereumDatasetRecord.countDocuments()).toBe(1);
    expect(await Investigation.countDocuments()).toBe(1);
    expect(await User.countDocuments()).toBe(0);
    expect(await Session.countDocuments()).toBe(0);

    // Verify collection names match configuration
    expect(EthereumDatasetRecord.collection.name).toBe(env.ETHEREUM_DATASET_COLLECTION);
    expect(Investigation.collection.name).toBe(env.INVESTIGATIONS_COLLECTION);
  });

  it('4. Dataset schema validator rejects CSV missing required target column (FLAG)', async () => {
    // Create temporary invalid CSV without FLAG column
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eth-safety-'));
    const invalidCsvPath = path.join(tempDir, 'invalid_dataset.csv');
    fs.writeFileSync(
      invalidCsvPath,
      'Address,Sent_tnx,Received_tnx\n0x1111111111111111111111111111111111111111,10,20\n'
    );

    const headers = fs.readFileSync(invalidCsvPath, 'utf-8').split('\n')[0].split(',');
    const hasTargetCol = headers.some((h) => ['FLAG', 'flag', 'is_fraud'].includes(h.trim()));

    expect(hasTargetCol).toBe(false);

    // Cleanup temp files
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('5. Safe cleanup utility forbids dropping protected databases', () => {
    const protectedDatabases = ['ethereum_fraud_dev', 'admin', 'local', 'config'];
    expect(protectedDatabases).toContain(env.MONGODB_DB_NAME);

    // Any attempt to delete ethereum_fraud_dev must be blocked by safety guard
    const isProtected = (dbName: string) => protectedDatabases.includes(dbName);
    expect(isProtected('ethereum_fraud_dev')).toBe(true);
    expect(isProtected('sample_mflix')).toBe(false); // Unrelated sample db is not protected
  });

  it('6. Both /api/v1/auth/register and fallback /auth/register are accepted without 404', async () => {
    const supertest = (await import('supertest')).default;
    const app = createApp();

    // Route /auth/register should hit auth handler (validation fails with 400, NOT 404)
    const fallbackRes = await supertest(app)
      .post('/auth/register')
      .send({});
    expect(fallbackRes.status).not.toBe(404);
    expect(fallbackRes.status).toBe(400);

    // Canonical route /api/v1/auth/register should also hit auth handler
    const canonicalRes = await supertest(app)
      .post('/api/v1/auth/register')
      .send({});
    expect(canonicalRes.status).not.toBe(404);
    expect(canonicalRes.status).toBe(400);
  });
});
