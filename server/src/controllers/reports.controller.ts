import { Request, Response } from 'express';
import { SaleModel } from '../modals/sale.model';
import { PurchaseModel } from '../modals/purchase.model';
import { ProductModel } from '../modals/product.model';

export const salesReport = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.query;
        const match: any = { status: 'posted' };
        if (from || to) match.date = {};
        if (from) match.date.$gte = new Date(String(from));
        if (to) match.date.$lte = new Date(String(to));
        const agg = await SaleModel.aggregate([
            { $match: match },
            { $group: { _id: null, totalSales: { $sum: '$total' }, count: { $sum: 1 } } }
        ]);
        return res.status(200).json({ success: true, data: agg[0] || { totalSales: 0, count: 0 } });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const purchasesReport = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.query;
        const match: any = { status: 'posted' };
        if (from || to) match.date = {};
        if (from) match.date.$gte = new Date(String(from));
        if (to) match.date.$lte = new Date(String(to));
        const agg = await PurchaseModel.aggregate([
            { $match: match },
            { $group: { _id: null, totalPurchases: { $sum: '$total' }, count: { $sum: 1 } } }
        ]);
        return res.status(200).json({ success: true, data: agg[0] || { totalPurchases: 0, count: 0 } });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const stockValuation = async (_req: Request, res: Response) => {
    try {
        const agg = await ProductModel.aggregate([
            { $project: { sku: 1, name: 1, stock: 1, unitPrice: 1, value: { $multiply: ['$stock', '$costPrice'] } } },
            { $sort: { value: -1 } }
        ]);
        return res.status(200).json({ success: true, data: agg });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export default { salesReport, purchasesReport, stockValuation };
