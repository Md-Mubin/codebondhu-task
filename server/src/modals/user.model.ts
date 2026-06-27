import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'admin' | 'manager' | 'clerk';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['admin', 'manager', 'clerk'], default: 'clerk' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
