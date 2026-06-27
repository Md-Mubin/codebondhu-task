import { Router } from 'express';
import authRoutes from './auth.routes';
import { auth } from '../middlewares/auth.middleware';
import usersRoutes from './users.routes';
import productsRoutes from './products.routes';
import customersRoutes from './customers.routes';
import suppliersRoutes from './suppliers.routes';
import purchasesRoutes from './purchases.routes';
import salesRoutes from './sales.routes';
import inventoryRoutes from './inventory.routes';
import dashboardRoutes from './dashboard.routes';
import reportsRoutes from './reports.routes';

const router = Router();

// public routes
router.use(authRoutes);

// require auth for all subsequent routes
router.use(auth);

// protected routes
router.use(usersRoutes);
router.use(productsRoutes);
router.use(customersRoutes);
router.use(suppliersRoutes);
router.use(purchasesRoutes);
router.use(salesRoutes);
router.use(inventoryRoutes);
router.use(dashboardRoutes);
router.use(reportsRoutes);

export default router;
