import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'creator' | 'enterprise' | 'admin';

export interface IUser extends Document {
  username: string;
  fullName: string;
  email?: string;
  passwordHash?: string;
  walletAddress?: string;
  profileImage?: string;
  bio?: string;
  role: UserRole;
  reputationScore: number;
  verified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: false,
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum / Polygon wallet address'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    role: {
      type: String,
      enum: ['creator', 'enterprise', 'admin'],
      default: 'creator',
    },
    reputationScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 1000,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ walletAddress: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
