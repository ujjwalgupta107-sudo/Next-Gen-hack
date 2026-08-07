import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from './User';

export interface IRole extends Document {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: string[];
  createdAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ['creator', 'enterprise', 'admin'],
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
