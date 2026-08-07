import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVerificationLog extends Document {
  uploadedHash: string;
  result: 'exact_match' | 'near_match' | 'no_match';
  matchedAssetId?: mongoose.Types.ObjectId;
  similarityScore?: number;
  verifierAddress?: string;
  verifierId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const VerificationLogSchema = new Schema<IVerificationLog>(
  {
    uploadedHash: {
      type: String,
      required: true,
      index: true,
    },
    result: {
      type: String,
      enum: ['exact_match', 'near_match', 'no_match'],
      required: true,
      index: true,
    },
    matchedAssetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    similarityScore: {
      type: Number,
      default: 0,
    },
    verifierAddress: {
      type: String,
      lowercase: true,
      trim: true,
    },
    verifierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

VerificationLogSchema.index({ uploadedHash: 1, timestamp: -1 });

export const VerificationLog: Model<IVerificationLog> =
  mongoose.models.VerificationLog ||
  mongoose.model<IVerificationLog>('VerificationLog', VerificationLogSchema);
