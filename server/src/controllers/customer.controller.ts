import { Request, Response } from 'express';
import { CustomerModel } from '../modals/customer.model';

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await CustomerModel.create(req.body);
        return res.status(201).json({ success: true, data: customer });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const listCustomers = async (req: Request, res: Response) => {
    try {
        const items = await CustomerModel.find({ isActive: true }).limit(100).lean();
        return res.status(200).json({ success: true, data: items });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const getCustomer = async (req: Request, res: Response) => {
    try {
        const c = await CustomerModel.findById(req.params.id).lean();
        if (!c) return res.status(404).json({ success: false, error: 'not found' });
        return res.status(200).json({ success: true, data: c });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const updated = await CustomerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, error: 'not found' });
        return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const updated = await CustomerModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!updated) return res.status(404).json({ success: false, error: 'not found' });
        return res.status(204).json({ success: true, data: null });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export default { createCustomer, listCustomers, getCustomer, updateCustomer, deleteCustomer };
