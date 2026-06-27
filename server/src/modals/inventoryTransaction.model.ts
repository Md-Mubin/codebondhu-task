import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryTransaction extends Document {
  productId: mongoose.Types.ObjectId;
  type: 'purchase_in' | 'sale_out' | 'adjust' | string;
  referenceId?: mongoose.Types.ObjectId;
  qtyChange: number;
  previousStock?: number;
  newStock?: number;
  note?: string;
  userId?: mongoose.Types.ObjectId;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    qtyChange: { type: Number, required: true },
    previousStock: { type: Number },
    newStock: { type: Number },
    note: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

InventoryTransactionSchema.index({ productId: 1, createdAt: -1 });

export const InventoryTransactionModel = mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
