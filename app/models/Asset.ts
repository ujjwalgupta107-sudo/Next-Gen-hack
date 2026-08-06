import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  title: string;
  description: string;
  contentType: string;
  fileMetadata: {
    name: string;
    mimeType: string;
    size: number;
  };
  fingerprints: {
    sha256: string;
    sha3: string;
    blake3: string;
    aiHash: string; // From FastAPI (CLIP/CodeBERT)
  };
  blockchain: {
    txHash: string;
    blockNumber: number;
    timestamp: number;
    chain: string;
    gasUsed: string;
  };
  ipfsCID: string;
  thumbnailCID?: string;
  nftTokenId?: number;
  status: 'pending' | 'registered' | 'disputed';
  verificationCount: number;
  ownerAddress: string;
  createdAt: Date;
}

const AssetSchema = new Schema<IAsset>({
  title: { type: String, required: true },
  description: { type: String },
  contentType: { type: String, required: true },
  fileMetadata: {
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  fingerprints: {
    sha256: { type: String, required: true, unique: true },
    sha3: { type: String },
    blake3: { type: String },
    aiHash: { type: String },
  },
  blockchain: {
    txHash: { type: String },
    blockNumber: { type: Number },
    timestamp: { type: Number },
    chain: { type: String, default: 'Polygon Amoy' },
    gasUsed: { type: String },
  },
  ipfsCID: { type: String },
  thumbnailCID: { type: String },
  nftTokenId: { type: Number },
  status: { type: String, enum: ['pending', 'registered', 'disputed'], default: 'pending' },
  verificationCount: { type: Number, default: 0 },
  ownerAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Asset = mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);
