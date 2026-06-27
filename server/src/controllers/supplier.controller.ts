import { Request, Response } from 'express';
import { SupplierModel } from '../modals/supplier.model';

export const createSupplier = async (req: Request, res: Response) => {
    try {
        const supplier = await SupplierModel.create(req.body);
        return res.status(201).json({ success: true, data: supplier });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const listSuppliers = async (req: Request, res: Response) => {
    const items = await SupplierModel.find({ isActive: true }).limit(100).lean();
    return res.status(200).json({ success: true, data: items });
};

export const getSupplier = async (req: Request, res: Response) => {
    const s = await SupplierModel.findById(req.params.id).lean();
    if (!s) return res.status(404).json({ success: false, error: 'not found' });
    return res.status(200).json({ success: true, data: s });
};

export const updateSupplier = async (req: Request, res: Response) => {
    const updated = await SupplierModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'not found' });
    return res.status(200).json({ success: true, data: updated });
};

export const deleteSupplier = async (req: Request, res: Response) => {
    const updated = await SupplierModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'not found' });
    return res.status(204).json({ success: true, data: null });
};

export default { createSupplier, listSuppliers, getSupplier, updateSupplier, deleteSupplier };
