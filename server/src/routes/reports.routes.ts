import { Router } from 'express';
import reportsController from '../controllers/reports.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/reports/sales', rbac(['admin','manager']), reportsController.salesReport);
router.get('/reports/purchases', rbac(['admin','manager']), reportsController.purchasesReport);
router.get('/reports/stock-valuation', rbac(['admin','manager']), reportsController.stockValuation);

export default router;
