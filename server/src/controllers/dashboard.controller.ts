import { Request, Response } from 'express';
import { SaleModel } from '../modals/sale.model';
import { PurchaseModel } from '../modals/purchase.model';
import { ProductModel } from '../modals/product.model';
import { SupplierModel } from '../modals/supplier.model';
import { CustomerModel } from '../modals/customer.model';

export const getOverview = async (_req: Request, res: Response) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const totalCustomers = await CustomerModel.countDocuments();
        const totalSuppliers = await SupplierModel.countDocuments();
        const totalSales = await SaleModel.aggregate([
            { $match: { date: { $gte: since }, status: 'posted' } },
            { $unwind: '$items' },
            { $group: { _id: null, total: { $sum: '$items.qty' } } }
        ]);
        const totalPurchases = await PurchaseModel.aggregate([
            { $match: { date: { $gte: since }, status: 'posted' } },
            { $unwind: '$items' },
            { $group: { _id: null, qty: { $sum: '$items.qty' } } }
        ]);
        const products = await ProductModel.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$stock' } } }
        ]);
        const salesTotal = totalSales[0]?.total || 0;
        const purchasesTotal = totalPurchases[0]?.qty || 0;
        const totalProducts = products[0]?.total || 0;
        const lowStock = await ProductModel.find({ $expr: { $lte: ['$stock', '$reorderPoint'] } }).limit(10).lean();
        return res.status(200).json({ success: true, data: { totalSales: salesTotal, totalPurchases: purchasesTotal, lowStock, totalProducts, totalCustomers, totalSuppliers } });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const getTopProducts = async (_req: Request, res: Response) => {
    try {
        const agg = await SaleModel.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.productId', qty: { $sum: '$items.qty' } } },
            { $sort: { qty: -1 } },
            { $limit: 10 }
        ]);
        return res.status(200).json({ success: true, data: agg });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const getTopPurchases = async (_req: Request, res: Response) => {
    try {
        const agg = await PurchaseModel.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.productId', qty: { $sum: '$items.qty' } } },
            { $sort: { qty: -1 } },
            { $limit: 10 }
        ]);
        return res.status(200).json({ success: true, data: agg });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export default { getOverview, getTopProducts, getTopPurchases };
