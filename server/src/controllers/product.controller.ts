import { Request, Response } from 'express';
import { ProductModel } from '../modals/product.model';

export const createProduct = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const product = await ProductModel.create(payload);
        return res.status(201).json({ success: true, data: product });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const listProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Number(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const filter: any = { isActive: true };
        if (req.query.q) filter.$text = { $search: String(req.query.q) };
        const [items, total] = await Promise.all([ProductModel.find(filter).skip(skip).limit(limit).lean(), ProductModel.countDocuments(filter)]);
        return res.status(200).json({ success: true, data: { items, total, page, limit } });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const p = await ProductModel.findById(req.params.id).lean();
        if (!p) return res.status(404).json({ success: false, error: 'not found' });
        return res.status(200).json({ success: true, data: p });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const updated = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, error: 'not found' });
        return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const updated = await ProductModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!updated) return res.status(404).json({ success: false, error: 'not found' });
        return res.status(204).json({ success: true, data: null });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const findOrCreateProduct = async (req: Request, res: Response) => {
    try {
        const { sku, name, supplierId } = req.body;
        if (!sku || !name) {
            return res.status(400).json({ success: false, error: 'SKU and name required' });
        }
        
        let product = await ProductModel.findOne({ sku }).lean();
        if (!product) {
            product = await ProductModel.create({
                sku,
                name,
                costPrice: 0,
                stock: 0,
                reorderPoint: 0,
                isActive: true,
                supplierId: supplierId || undefined
            });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export default { createProduct, listProducts, getProduct, updateProduct, deleteProduct, findOrCreateProduct };
