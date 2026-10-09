import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment Schema Definition
 * Enforces strict typing and validation for runtime configuration.
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
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

  // Stage 2+ placeholders - optional in Stage 1, validated if provided
  ML_SERVICE_URL: z.string().url().optional(),
  ML_SERVICE_API_KEY: z.string().min(1).optional(),
  ETHEREUM_RPC_URL: z.string().url().optional(),
  ETHERSCAN_API_KEY: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(16).optional(),
  JWT_REFRESH_SECRET: z.string().min(16).optional(),
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

  // Production safety check
  if (parsed.data.NODE_ENV === 'production') {
    if (!parsed.data.MONGODB_URI.startsWith('mongodb+srv://') && !parsed.data.MONGODB_URI.startsWith('mongodb://')) {
      throw new Error('[CONFIG ERROR] Production requires a valid MONGODB_URI.');
    }
  }

  return parsed.data;
}

export const env = validateEnv();
