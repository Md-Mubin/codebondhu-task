import { Router } from 'express';
import usersController from '../controllers/users.controller';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/users', rbac(['admin']), usersController.createUser);
router.get('/users', rbac(['admin']), usersController.listUsers);
router.get('/users/:id', rbac(['admin']), usersController.getUser);
router.put('/users/:id', rbac(['admin']), usersController.updateUser);
router.delete('/users/:id', rbac(['admin']), usersController.deleteUser);

export default router;
