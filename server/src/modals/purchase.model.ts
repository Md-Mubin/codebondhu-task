import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchaseItem {
  productId?: mongoose.Types.ObjectId;
  sku?: string;
  name?: string;
  qty: number;
  unitCost: number;
  lineTotal: number;
}

export interface IPurchase extends Document {
  supplierId: mongoose.Types.ObjectId;
  invoiceNo?: string;
  date: Date;
  items: IPurchaseItem[];
  subtotal: number;
  total: number;
  status: string;
}

const PurchaseItemSchema = new Schema<IPurchaseItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  sku: { type: String },
  name: { type: String },
  qty: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  lineTotal: { type: Number, required: true }
});

const PurchaseSchema = new Schema<IPurchase>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    invoiceNo: { type: String },
    date: { type: Date, default: Date.now },
    items: { type: [PurchaseItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, default: 'draft' }
  },
  { timestamps: true }
);

export const PurchaseModel = mongoose.model<IPurchase>('Purchase', PurchaseSchema);
