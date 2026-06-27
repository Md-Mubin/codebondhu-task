import { Router } from 'express';
import inventoryController from '../controllers/inventory.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/inventory/transactions', rbac(['admin', 'manager']), inventoryController.listInventoryTransactions);
router.get('/inventory/:productId/history', rbac(['admin', 'manager']), inventoryController.getProductHistory);
router.post('/inventory/adjust', rbac(['admin']), inventoryController.adjustInventory);

export default router;
