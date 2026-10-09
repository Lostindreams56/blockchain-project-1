import { Schema, model, Document, Types } from 'mongoose';

export interface ISession {
  userId: Types.ObjectId;
  tokenHash: string;
  familyId: string;
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDocument extends ISession, Document {}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'],
      unique: true,
      index: true,
    },
    familyId: {
      type: String,
      required: [true, 'Token family identifier is required'],
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Session expiration timestamp is required'],
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB TTL index to automatically purge expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for querying user active sessions / family revocation
sessionSchema.index({ userId: 1, familyId: 1 });

export const Session = model<SessionDocument>('Session', sessionSchema);
