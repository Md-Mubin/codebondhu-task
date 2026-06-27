import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  description?: string;
  unitPrice?: number;
  costPrice?: number;
  stock: number;
  reorderPoint?: number;
  isActive: boolean;
  supplierId?: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    unitPrice: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    reorderPoint: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' }
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
