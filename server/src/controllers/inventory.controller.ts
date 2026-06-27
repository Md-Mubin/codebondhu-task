import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { InventoryTransactionModel } from '../modals/inventoryTransaction.model';
import { ProductModel } from '../modals/product.model';

export const listInventoryTransactions = async (_req: Request, res: Response) => {
    try {
        const items = await InventoryTransactionModel.find().sort({ createdAt: -1 }).limit(200).lean();
        return res.status(200).json({ success: true, data: items });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const getProductHistory = async (req: Request, res: Response) => {
    try {
        const items = await InventoryTransactionModel.find({ productId: req.params.productId }).sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, data: items });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const adjustInventory = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { productId, qtyChange, note } = req.body;
        if (!productId || typeof qtyChange !== 'number') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, error: 'productId and qtyChange required' });
        }
        const prod = await ProductModel.findById(productId).session(session);
        if (!prod) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, error: 'product not found' });
        }
        const prev = prod.stock || 0;
        prod.stock = prev + qtyChange;
        if (prod.stock < 0) prod.stock = 0;
        await prod.save({ session });
        await InventoryTransactionModel.create([
            {
                productId: prod._id,
                type: 'adjust',
                qtyChange,
                previousStock: prev,
                newStock: prod.stock,
                note
            }
        ], { session });
        await session.commitTransaction();
        return res.status(200).json({ success: true, data: prod });
    } catch (err: any) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    } finally {
        session.endSession();
    }
};

export default { listInventoryTransactions, getProductHistory, adjustInventory };
