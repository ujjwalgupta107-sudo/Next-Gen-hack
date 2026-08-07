import mongoose, { Schema, Document, Model } from 'mongoose';

export type LicenseType = 'personal' | 'commercial' | 'exclusive';

export interface ILicense extends Document {
  assetId: mongoose.Types.ObjectId;
  licenseType: LicenseType;
  price: string;
  creatorAddress: string;
  buyerAddress: string;
  txHash: string;
  active: boolean;
  termsUri?: string;
  expiresAt?: Date | null;
  createdAt: Date;
}

const LicenseSchema = new Schema<ILicense>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    licenseType: {
      type: String,
      enum: ['personal', 'commercial', 'exclusive'],
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    buyerAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    termsUri: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

LicenseSchema.index({ creatorAddress: 1, createdAt: -1 });
LicenseSchema.index({ buyerAddress: 1, createdAt: -1 });

export const License: Model<ILicense> =
  mongoose.models.License || mongoose.model<ILicense>('License', LicenseSchema);
