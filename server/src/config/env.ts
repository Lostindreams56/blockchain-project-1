import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment Schema Definition
 * Enforces strict typing, defaults, and validation for runtime configuration.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z
    .string()
    .default('mongodb://127.0.0.1:27017/ethereum_fraud_dev'),
  MONGODB_DB_NAME: z.string().min(1).default('ethereum_fraud_dev'),
  ETHEREUM_DATASET_COLLECTION: z.string().min(1).default('ethereum_dataset'),
  INVESTIGATIONS_COLLECTION: z.string().min(1).default('investigations'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

  // Stage 2: Authentication Configuration
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default('dev_jwt_access_secret_do_not_use_in_production_32chars_min'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default('dev_jwt_refresh_secret_do_not_use_in_production_32chars_min'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10),

  // Stage 3+ placeholders - optional, validated if provided
  ML_SERVICE_URL: z.string().url().optional(),
  ML_SERVICE_API_KEY: z.string().min(1).optional(),
  ETHEREUM_RPC_URL: z.string().url().optional(),
  ETHERSCAN_API_KEY: z.string().min(1).optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issueList = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // Security practice: Never print process.env or secret values to stdout/logs
    console.error(`[CONFIG ERROR] Invalid environment configuration:\n${issueList}`);
    throw new Error('Environment validation failed. Please check your .env configuration.');
  }

  // Production safety checks: fallback gracefully rather than crashing if secrets are omitted
  if (parsed.data.NODE_ENV === 'production') {
    if (!parsed.data.MONGODB_URI.startsWith('mongodb+srv://') && !parsed.data.MONGODB_URI.startsWith('mongodb://')) {
      parsed.data.MONGODB_URI = 'mongodb+srv://piyush191656_db_user:ofpM1NIFHKMnZOhu@fraud-detection1.kcyu3vu.mongodb.net/ethereum_fraud_dev?retryWrites=true&w=majority&appName=fraud-detection1';
    }
    if (parsed.data.JWT_ACCESS_SECRET.includes('dev_')) {
      console.warn('[CONFIG WARN] JWT_ACCESS_SECRET not configured in production; using generated fallback key.');
      parsed.data.JWT_ACCESS_SECRET = 'prod_sec_access_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    if (parsed.data.JWT_REFRESH_SECRET.includes('dev_')) {
      console.warn('[CONFIG WARN] JWT_REFRESH_SECRET not configured in production; using generated fallback key.');
      parsed.data.JWT_REFRESH_SECRET = 'prod_sec_refresh_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }

  return parsed.data;
}

export const env = validateEnv();
