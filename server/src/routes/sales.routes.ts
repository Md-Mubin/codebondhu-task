import { Router } from 'express';
import saleController from '../controllers/sale.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/sales/:id/invoice', rbac(['admin','manager','clerk']), saleController.downloadInvoice);
router.post('/sales', rbac(['admin','manager','clerk']), saleController.createSale);
router.put('/sales/:id', rbac(['admin','manager','clerk']), saleController.updateSale);
router.post('/sales/:id/post', rbac(['admin','manager']), saleController.postSale);
router.post('/sales/:id/cancel', rbac(['admin','manager']), saleController.cancelSale);
router.get('/sales', rbac(['admin','manager','clerk']), saleController.listSales);
router.get('/sales/:id', rbac(['admin','manager','clerk']), saleController.getSale);

export default router;
