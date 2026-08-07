import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INFT extends Document {
  tokenId: number;
  assetId?: mongoose.Types.ObjectId;
  ownerAddress: string;
  creatorAddress: string;
  contractAddress: string;
  tokenURI: string;
  metadata: Record<string, any>;
  mintTxHash: string;
  chain: string;
  mintedAt: Date;
}

const NFTSchema = new Schema<INFT>(
  {
    tokenId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    ownerAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contractAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    tokenURI: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    mintTxHash: {
      type: String,
      required: true,
      unique: true,
    },
    chain: {
      type: String,
      default: 'Polygon Amoy',
    },
    mintedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

NFTSchema.index({ ownerAddress: 1, mintedAt: -1 });
NFTSchema.index({ tokenId: 1 }, { unique: true });

export const NFT: Model<INFT> =
  mongoose.models.NFT || mongoose.model<INFT>('NFT', NFTSchema);
