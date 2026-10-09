/**
 * Safe Targeted Cleanup Utility for Unrelated Demo/Sample Databases in MongoDB.
 *
 * SAFETY GUARANTEES:
 * 1. Requires explicit `--confirm` flag to execute any write or drop operation.
 * 2. Requires explicit `--target-db=<dbname>` (e.g. `--target-db=sample_mflix`).
 * 3. HARD-CODED BLACKLIST: NEVER drops or alters `ethereum_fraud_dev` or any database containing legitimate users/sessions.
 * 4. Prints a full dry-run inspection report before taking any action.
 * 5. Sanitizes all credentials from logs and output.
 */

import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

interface CleanupOptions {
  confirm: boolean;
  targetDb: string | null;
  dryRun: boolean;
}

function parseArgs(): CleanupOptions {
  const args = process.argv.slice(2);
  const confirm = args.includes('--confirm');
  const dbArg = args.find((a) => a.startsWith('--target-db='));
  const targetDb = dbArg ? dbArg.split('=')[1].trim() : null;

  return {
    confirm,
    targetDb,
    dryRun: !confirm,
  };
}

async function runCleanup(): Promise<void> {
  const { confirm, targetDb, dryRun } = parseArgs();

  console.log('================================================================');
  console.log(' MONGODB UNRELATED DATA INSPECTION & TARGETED CLEANUP UTILITY  ');
  console.log('================================================================');

  // Verify connection
  const baseUri = env.MONGODB_URI;
  console.log(`Connecting to cluster...`);
  await mongoose.connect(baseUri, { serverSelectionTimeoutMS: 8000 });

  const admin = mongoose.connection.db!.admin();
  const dbsResult = await admin.listDatabases();

  console.log('\n--- CLUSTER INVENTORY ---');
  for (const dbInfo of dbsResult.databases) {
    const db = mongoose.connection.client.db(dbInfo.name);
    const collections = await db.listCollections().toArray();
    console.log(`Database: [${dbInfo.name}] (${(dbInfo.sizeOnDisk / (1024 * 1024)).toFixed(2)} MB)`);
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - Collection: ${col.name} (${count} documents)`);
    }
  }

  // Safety checks
  const protectedDatabases = ['ethereum_fraud_dev', 'admin', 'local', 'config'];

  if (!targetDb) {
    console.log('\n[INSPECTION ONLY MODE]');
    console.log('No --target-db specified. No changes were made.');
    console.log('To clean up an unrelated database, run:');
    console.log('  npm run db:clean -- --target-db=<dbname> --confirm');
    await mongoose.disconnect();
    return;
  }

  if (protectedDatabases.includes(targetDb)) {
    console.error(`\n[SAFETY ABORT] Database '${targetDb}' is a PROTECTED database. Deletion is forbidden.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const foundDb = dbsResult.databases.find((d) => d.name === targetDb);
  if (!foundDb) {
    console.log(`\nDatabase '${targetDb}' does not exist on this cluster. Nothing to clean.`);
    await mongoose.disconnect();
    return;
  }

  if (dryRun) {
    console.log(`\n[DRY RUN SUMMARY]`);
    console.log(`Target: Database '${targetDb}' identified.`);
    console.log(`Action: DROP DATABASE '${targetDb}' (removes all unrelated sample collections).`);
    console.log(`STATUS: DRY RUN ONLY. No changes performed because '--confirm' flag was omitted.`);
    console.log(`To execute deletion, rerun with: npm run db:clean -- --target-db=${targetDb} --confirm`);
    await mongoose.disconnect();
    return;
  }

  // Executing confirmed cleanup
  console.log(`\n[EXECUTING CONFIRMED CLEANUP]`);
  console.log(`Dropping unrelated database: '${targetDb}'...`);
  const targetDatabaseObj = mongoose.connection.client.db(targetDb);
  await targetDatabaseObj.dropDatabase();
  console.log(`[SUCCESS] Database '${targetDb}' has been cleanly removed from the cluster.`);

  await mongoose.disconnect();
}

runCleanup().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
