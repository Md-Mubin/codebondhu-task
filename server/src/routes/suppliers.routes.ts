import { Router } from 'express';
import supplierController from '../controllers/supplier.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/suppliers', rbac(['admin','manager']), supplierController.createSupplier);
router.get('/suppliers', rbac(['admin','manager']), supplierController.listSuppliers);
router.get('/suppliers/:id', rbac(['admin','manager']), supplierController.getSupplier);
router.put('/suppliers/:id', rbac(['admin','manager']), supplierController.updateSupplier);
router.delete('/suppliers/:id', rbac(['admin','manager']), supplierController.deleteSupplier);

export default router;
