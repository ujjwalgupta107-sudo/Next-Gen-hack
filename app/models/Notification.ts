import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'asset_registered'
  | 'verification'
  | 'nft_minted'
  | 'license_purchased'
  | 'security_alert'
  | 'system';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;
  walletAddress?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
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
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'asset_registered',
        'verification',
        'nft_minted',
        'license_purchased',
        'security_alert',
        'system',
      ],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ walletAddress: 1, read: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
