import mongoose, { Schema, Document, Model } from 'mongoose';

export type ActivityAction =
  | 'signup'
  | 'login'
  | 'siwe_login'
  | 'logout'
  | 'update_profile'
  | 'change_password'
  | 'link_wallet'
  | 'unlink_wallet'
  | 'register_asset'
  | 'verify_asset'
  | 'mint_nft'
  | 'purchase_license'
  | 'security_event';

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  walletAddress?: string;
  action: ActivityAction;
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    walletAddress: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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

ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ walletAddress: 1, timestamp: -1 });

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
