import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export type DbStatus = {
  status: 'connected' | 'connecting' | 'disconnecting' | 'disconnected';
  readyState: number;
  isReady: boolean;
};

/**
 * Reusable MongoDB Connection Manager.
 * Handles connect/disconnect events, error logging, and status reporting for readiness probes.
 */
class DatabaseManager {
  private isConnecting: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection successfully established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err: err.message }, 'MongoDB connection error occurred');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected');
    });
  }

  /**
   * Sanitizes MongoDB URI for logging (strips username and password if present)
   */
  private sanitizeUri(uri: string): string {
    try {
      const parsed = new URL(uri);
      if (parsed.password) parsed.password = '***';
      if (parsed.username) parsed.username = '***';
      return parsed.toString();
    } catch {
      return 'mongodb://[credentials-hidden]';
    }
  }

  /**
   * Connects to MongoDB Atlas or local instance.
   * Catches errors gracefully so the application server can still start
   * and serve health checks even if DB is temporarily unreachable.
   */
  public async connect(): Promise<boolean> {
    if (mongoose.connection.readyState === 1) {
      logger.debug('MongoDB already connected');
      return true;
    }

    if (this.isConnecting) {
      logger.debug('MongoDB connection attempt already in progress');
      return false;
    }

    this.isConnecting = true;
    const sanitized = this.sanitizeUri(env.MONGODB_URI);
    logger.info(`Attempting MongoDB connection to ${sanitized}...`);

    try {
      await mongoose.connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB_NAME,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        autoIndex: env.NODE_ENV !== 'production',
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown database error';
      logger.error({ err: message }, 'Failed to connect to MongoDB. Server will remain running in degraded mode.');
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Closes the active MongoDB connection gracefully.
   */
  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      logger.info('Closing MongoDB connection...');
      await mongoose.disconnect();
      logger.info('MongoDB connection closed.');
    }
  }

  /**
   * Inspects current Mongoose connection status.
   */
  public getStatus(): DbStatus {
    const readyState = mongoose.connection.readyState;
    const stateMap: Record<number, DbStatus['status']> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const status = stateMap[readyState] ?? 'disconnected';
    return {
      status,
      readyState,
      isReady: readyState === 1,
    };
  }
}

export const dbManager = new DatabaseManager();
