import mongoose, { Schema, Document } from 'mongoose';
import { IAsset } from './Asset';

export interface IVerification extends Document {
  uploadedHash: string; // The SHA-256 of the uploaded verification file
  result: 'exact_match' | 'near_match' | 'no_match';
  matchedAssetId?: mongoose.Types.ObjectId | IAsset;
  similarityScore?: number; // From FastAPI FAISS search
  verifierAddress?: string;
  timestamp: Date;
}

const VerificationSchema = new Schema<IVerification>({
  uploadedHash: { type: String, required: true },
  result: { type: String, enum: ['exact_match', 'near_match', 'no_match'], required: true },
  matchedAssetId: { type: Schema.Types.ObjectId, ref: 'Asset' },
  similarityScore: { type: Number },
  verifierAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const Verification = mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema);
