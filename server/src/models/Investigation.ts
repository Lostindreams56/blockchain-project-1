import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { env } from '../config/env.js';

export interface IInvestigation extends Document {
  targetAddress: string;
  riskScore: number;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  classification: 'LEGITIMATE' | 'ILLICIT' | 'UNINDEXED';
  keyDrivers: string[];
  investigatorId?: Types.ObjectId;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestigationSchema = new Schema<IInvestigation>(
  {
    targetAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskTier: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      index: true,
    },
    classification: {
      type: String,
      required: true,
      enum: ['LEGITIMATE', 'ILLICIT', 'UNINDEXED'],
    },
    keyDrivers: {
      type: [String],
      default: [],
    },
    investigatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED'],
      default: 'OPEN',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    collection: env.INVESTIGATIONS_COLLECTION,
    timestamps: true,
    versionKey: false,
  }
);

export const Investigation: Model<IInvestigation> =
  mongoose.models.Investigation ||
  mongoose.model<IInvestigation>(
    'Investigation',
    InvestigationSchema,
    env.INVESTIGATIONS_COLLECTION
  );
