import { Router } from 'express';
import purchaseController from '../controllers/purchase.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/purchases', rbac(['admin','manager']), purchaseController.createPurchase);
router.put('/purchases/:id', rbac(['admin','manager']), purchaseController.updatePurchase);
router.post('/purchases/:id/post', rbac(['admin','manager']), purchaseController.postPurchase);
router.post('/purchases/:id/cancel', rbac(['admin','manager']), purchaseController.cancelPurchase);
router.get('/purchases', rbac(['admin','manager']), purchaseController.listPurchases);
router.get('/purchases/:id', rbac(['admin','manager']), purchaseController.getPurchase);

export default router;
