import mongoose, { Document, Schema } from 'mongoose';

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  sku?: string;
  name?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ISale extends Document {
  customerId: mongoose.Types.ObjectId;
  invoiceNo?: string;
  date: Date;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
}

const SaleItemSchema = new Schema<ISaleItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String },
  name: { type: String },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true }
});

const SaleSchema = new Schema<ISale>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    invoiceNo: { type: String },
    date: { type: Date, default: Date.now },
    items: { type: [SaleItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, default: 'draft' }
  },
  { timestamps: true }
);

export const SaleModel = mongoose.model<ISale>('Sale', SaleSchema);
