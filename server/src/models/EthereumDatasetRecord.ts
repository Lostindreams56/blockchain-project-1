import mongoose, { Schema, Document, Model } from 'mongoose';
import { env } from '../config/env.js';

export interface IEthereumDatasetRecord extends Document {
  rawRowId?: number | string;
  address?: string;
  flag: number; // 0 = Legitimate / Benign, 1 = Fraud / Illicit
  features: Record<string, number | string>;
  datasetSource: string;
  importedAt: Date;
}

const EthereumDatasetRecordSchema = new Schema<IEthereumDatasetRecord>(
  {
    rawRowId: { type: Schema.Types.Mixed, index: true },
    address: { type: String, trim: true, index: true },
    flag: { type: Number, required: true, enum: [0, 1], index: true },
    features: { type: Schema.Types.Mixed, required: true },
    datasetSource: { type: String, default: 'kaggle-vagifa', index: true },
    importedAt: { type: Date, default: Date.now },
  },
  {
    collection: env.ETHEREUM_DATASET_COLLECTION,
    timestamps: false,
    versionKey: false,
  }
);

export const EthereumDatasetRecord: Model<IEthereumDatasetRecord> =
  mongoose.models.EthereumDatasetRecord ||
  mongoose.model<IEthereumDatasetRecord>(
    'EthereumDatasetRecord',
    EthereumDatasetRecordSchema,
    env.ETHEREUM_DATASET_COLLECTION
  );
