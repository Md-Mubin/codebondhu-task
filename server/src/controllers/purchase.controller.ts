import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PurchaseModel } from '../modals/purchase.model';
import { ProductModel } from '../modals/product.model';
import { InventoryTransactionModel } from '../modals/inventoryTransaction.model';

export const createPurchase = async (req: Request, res: Response) => {
    try {
        const purchase = await PurchaseModel.create(req.body);
        return res.status(201).json({ success: true, data: purchase });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const updatePurchase = async (req: Request, res: Response) => {
    try {
        const updated = await PurchaseModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, error: 'not found' });
        return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const postPurchase = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const purchase = await PurchaseModel.findById(req.params.id)
            .populate('supplierId', 'name')
            .populate('items.productId', 'name sku')
            .session(session);
        if (!purchase) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, error: 'purchase not found' });
        }
        if (purchase.status === 'posted') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, error: 'already posted' });
        }

        for (const item of purchase.items) {
            let prod = item.productId ? await ProductModel.findById(item.productId).session(session) : null;
            const prevStock = prod ? prod.stock : 0;

            // Auto-create product if it doesn't exist or no productId provided
            if (!prod) {
                if (!item.sku || !item.name) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        success: false,
                        error: `SKU and name required for item without product`
                    });
                }
                prod = new ProductModel({
                    sku: item.sku,
                    name: item.name,
                    costPrice: item.unitCost,
                    stock: item.qty,
                    reorderPoint: 0,
                    isActive: true,
                    supplierId: purchase.supplierId
                });
                await prod.save({ session });
                item.productId = prod._id;
            } else {
                prod.stock = prevStock + item.qty;
                await prod.save({ session });
            }

            await InventoryTransactionModel.create([{
                productId: prod._id,
                type: 'purchase_in',
                referenceId: purchase._id,
                qtyChange: item.qty,
                previousStock: prevStock,
                newStock: prod.stock
            }], { session });
        }

        purchase.status = 'posted';
        await purchase.save({ session });
        await session.commitTransaction();
        return res.status(200).json({ success: true, data: purchase });
    } catch (err: any) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    } finally {
        session.endSession();
    }
};

export const cancelPurchase = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const purchase = await PurchaseModel.findById(req.params.id).session(session);
        if (!purchase) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, error: 'purchase not found' });
        }
        if (purchase.status !== 'posted') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, error: 'purchase not posted' });
        }

        for (const item of purchase.items) {
            const prod = await ProductModel.findById(item.productId).session(session);
            if (!prod) {
                await session.abortTransaction();
                return res.status(404).json({ success: false, error: `product not found for item` });
            }
            const prev = prod.stock || 0;
            prod.stock = prev - item.qty;
            if (prod.stock < 0) prod.stock = 0;
            await prod.save({ session });
            await InventoryTransactionModel.create([{
                productId: prod._id,
                type: 'purchase_reversal',
                referenceId: purchase._id,
                qtyChange: -item.qty,
                previousStock: prev,
                newStock: prod.stock
            }], { session });
        }

        purchase.status = 'cancelled';
        await purchase.save({ session });
        await session.commitTransaction();
        return res.status(200).json({ success: true, data: purchase });
    } catch (err: any) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    } finally {
        session.endSession();
    }
};

export const listPurchases = async (req: Request, res: Response) => {
    try {
        const items = await PurchaseModel.find().limit(100).lean();
        return res.status(200).json({ success: true, data: items });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const getPurchase = async (req: Request, res: Response) => {
    try {
        const p = await PurchaseModel.findById(req.params.id).lean();
        if (!p) return res.status(404).json({ success: false, error: 'not found' });
        return res.status(200).json({ success: true, data: p });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export default { createPurchase, updatePurchase, postPurchase, cancelPurchase, listPurchases, getPurchase };
