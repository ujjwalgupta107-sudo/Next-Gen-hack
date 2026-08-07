import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from './User';

export interface IAPIKey extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  keyPrefix: string;
  keyHash: string;
  role: UserRole;
  permissions: string[];
  lastUsed?: Date | null;
  active: boolean;
  createdAt: Date;
}

const APIKeySchema = new Schema<IAPIKey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['creator', 'enterprise', 'admin'],
      default: 'creator',
    },
    permissions: {
      type: [String],
      default: ['read:assets', 'write:assets', 'verify:assets'],
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const APIKey: Model<IAPIKey> =
  mongoose.models.APIKey || mongoose.model<IAPIKey>('APIKey', APIKeySchema);
