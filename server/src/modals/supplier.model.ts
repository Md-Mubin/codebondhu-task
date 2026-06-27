import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  isActive: boolean;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    paymentTerms: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const SupplierModel = mongoose.model<ISupplier>('Supplier', SupplierSchema);
