import { Router } from 'express';
import productController from '../controllers/product.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/products', rbac(['admin','manager']), productController.createProduct);
router.get('/products', rbac(['admin','manager','clerk']), productController.listProducts);
router.get('/products/:id', rbac(['admin','manager','clerk']), productController.getProduct);
router.put('/products/:id', rbac(['admin','manager']), productController.updateProduct);
router.delete('/products/:id', rbac(['admin','manager']), productController.deleteProduct);
router.post('/products/find-or-create', rbac(['admin','manager']), productController.findOrCreateProduct);

export default router;
