import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/dashboard/overview', rbac(['admin','manager','clerk']), dashboardController.getOverview);
router.get('/dashboard/top-products', rbac(['admin','manager','clerk']), dashboardController.getTopProducts);
router.get('/dashboard/top-purchases', rbac(['admin','manager','clerk']), dashboardController.getTopPurchases);

export default router;
