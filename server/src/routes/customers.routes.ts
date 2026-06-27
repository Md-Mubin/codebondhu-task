import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/customers', rbac(['admin','manager']), customerController.createCustomer);
router.get('/customers', rbac(['admin','manager','clerk']), customerController.listCustomers);
router.get('/customers/:id', rbac(['admin','manager','clerk']), customerController.getCustomer);
router.put('/customers/:id', rbac(['admin','manager']), customerController.updateCustomer);
router.delete('/customers/:id', rbac(['admin','manager']), customerController.deleteCustomer);

export default router;
