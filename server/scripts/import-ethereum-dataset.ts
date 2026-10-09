/**
 * Dedicated Kaggle Ethereum Fraud Detection Dataset Importer
 *
 * Designed for Kaggle dataset: vagifa/ethereum-frauddetection-dataset
 *
 * SAFETY & VALIDATION:
 * 1. Requires explicit `--file=<path>` argument. Never runs automatically.
 * 2. Validates file existence, format, headers, target column, and class distribution.
 * 3. Does not invent labels or substitute synthetic records.
 * 4. Inserts into isolated `ethereum_dataset` collection, never touching auth/session data.
 * 5. Supports `--validate-only` / `--dry-run` to preview validation without database writes.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { EthereumDatasetRecord } from '../src/models/EthereumDatasetRecord.js';

interface ImportOptions {
  filePath: string | null;
  dryRun: boolean;
  batchSize: number;
}

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const fileArg = args.find((a) => a.startsWith('--file='));
  const dryRun = args.includes('--dry-run') || args.includes('--validate-only');
  const batchArg = args.find((a) => a.startsWith('--batch-size='));

  return {
    filePath: fileArg ? fileArg.split('=')[1].trim() : null,
    dryRun,
    batchSize: batchArg ? parseInt(batchArg.split('=')[1], 10) || 500 : 500,
  };
}

function detectTargetColumn(headers: string[]): string | null {
  const candidates = ['FLAG', 'flag', 'is_fraud', 'fraud', 'IsFraud', 'target', 'label'];
  for (const c of candidates) {
    if (headers.includes(c)) return c;
  }
  return null;
}

async function runImporter(): Promise<void> {
  const { filePath, dryRun, batchSize } = parseArgs();

  console.log('================================================================');
  console.log(' ETHEREUM KAGGLE DATASET VALIDATOR & INGESTION PIPELINE        ');
  console.log('================================================================');

  if (!filePath) {
    console.error('\n[ERROR] Missing required --file argument.');
    console.error('Usage:');
    console.error('  npm run dataset:import -- --file=<path-to-transaction_dataset.csv> [--dry-run]');
    console.error('\nTo obtain the real Kaggle dataset:');
    console.error('  1. Visit: https://www.kaggle.com/datasets/vagifa/ethereum-frauddetection-dataset');
    console.error('  2. Download transaction_dataset.csv');
    console.error('  3. Run this command with the downloaded file path.\n');
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`\n[ERROR] Dataset file not found at: ${resolvedPath}`);
    console.error('Please verify the path and ensure the Kaggle file is downloaded.\n');
    process.exit(1);
  }

  const fileStats = fs.statSync(resolvedPath);
  console.log(`\nAnalyzing file: ${path.basename(resolvedPath)} (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB)...`);

  const fileStream = fs.createReadStream(resolvedPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers: string[] = [];
  let targetColIndex = -1;
  let addressColIndex = -1;
  let rawRowIndex = -1;

  let totalRows = 0;
  let countLegitimate = 0;
  let countFraud = 0;
  let countInvalid = 0;

  const recordsToInsert: Array<{
    rawRowId?: string | number;
    address?: string;
    flag: number;
    features: Record<string, number | string>;
    datasetSource: string;
    importedAt: Date;
  }> = [];

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(',').map((p) => p.trim());

    if (headers.length === 0) {
      headers = parts.map((h) => h.replace(/^["']|["']$/g, '').trim());
      const targetCol = detectTargetColumn(headers);

      if (!targetCol) {
        console.error(`\n[VALIDATION FAILED] Could not detect target fraud column in headers:`);
        console.error(`Detected headers: ${headers.slice(0, 15).join(', ')}...`);
        console.error(`Expected one of: FLAG, flag, is_fraud, fraud, target`);
        process.exit(1);
      }

      targetColIndex = headers.indexOf(targetCol);
      addressColIndex = headers.findIndex((h) => h.toLowerCase() === 'address');
      rawRowIndex = headers.findIndex((h) => h === '' || h.toLowerCase() === 'unnamed: 0');

      console.log(`[SCHEMA CONFIRMED]`);
      console.log(`  - Target Column: '${targetCol}' (index: ${targetColIndex})`);
      console.log(`  - Total Columns: ${headers.length}`);
      console.log(`  - Address Column Index: ${addressColIndex}`);
      continue;
    }

    totalRows++;
    const flagVal = parseInt(parts[targetColIndex], 10);

    if (flagVal === 0) {
      countLegitimate++;
    } else if (flagVal === 1) {
      countFraud++;
    } else {
      countInvalid++;
      continue;
    }

    if (!dryRun) {
      const features: Record<string, number | string> = {};
      for (let i = 0; i < headers.length; i++) {
        if (i === targetColIndex || i === addressColIndex || i === rawRowIndex) continue;
        const colName = headers[i];
        const numVal = parseFloat(parts[i]);
        features[colName] = isNaN(numVal) ? parts[i] : numVal;
      }

      recordsToInsert.push({
        rawRowId: rawRowIndex !== -1 ? parts[rawRowIndex] : totalRows,
        address: addressColIndex !== -1 ? parts[addressColIndex] : undefined,
        flag: flagVal,
        features,
        datasetSource: 'kaggle-vagifa',
        importedAt: new Date(),
      });
    }
  }

  console.log('\n--- DATASET VALIDATION REPORT ---');
  console.log(`Total Records Scanned:  ${totalRows}`);
  console.log(`Legitimate (Flag = 0):  ${countLegitimate} (${((countLegitimate / totalRows) * 100).toFixed(2)}%)`);
  console.log(`Illicit / Fraud (Flag = 1): ${countFraud} (${((countFraud / totalRows) * 100).toFixed(2)}%)`);
  console.log(`Invalid / Skipped Rows: ${countInvalid}`);

  if (countLegitimate === 0 || countFraud === 0) {
    console.error(`\n[VALIDATION FAILED] Dataset must contain both legitimate and fraud classes.`);
    process.exit(1);
  }

  if (dryRun) {
    console.log('\n[DRY RUN / VALIDATION ONLY]');
    console.log('The dataset format and class distribution are valid for ingestion.');
    console.log('No records were inserted into MongoDB.');
    console.log('To execute real import, run without --dry-run:');
    console.log(`  npm run dataset:import -- --file="${filePath}"`);
    return;
  }

  // Real Ingestion
  console.log(`\nConnecting to MongoDB (${env.MONGODB_DB_NAME})...`);
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`Ingesting ${recordsToInsert.length} validated records into '${env.ETHEREUM_DATASET_COLLECTION}' collection...`);

  let insertedCount = 0;
  for (let i = 0; i < recordsToInsert.length; i += batchSize) {
    const chunk = recordsToInsert.slice(i, i + batchSize);
    await EthereumDatasetRecord.insertMany(chunk, { ordered: false });
    insertedCount += chunk.length;
    process.stdout.write(`  Progress: ${insertedCount}/${recordsToInsert.length} records\r`);
  }

  console.log(`\n[SUCCESS] Successfully imported ${insertedCount} Kaggle records into MongoDB.`);
  console.log(`Target Collection: '${env.ETHEREUM_DATASET_COLLECTION}' in database '${env.MONGODB_DB_NAME}'.`);
  console.log(`Auth/Session collections remained completely isolated.`);

  await mongoose.disconnect();
}

runImporter().catch((err) => {
  console.error('\n[IMPORT ERROR]', err.message);
  process.exit(1);
});
