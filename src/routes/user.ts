import { Router } from 'express';
import UserController from '../controllers/UserController';
const router = Router();

const userController = UserController;

// Rota Register
router.post('/users/register', userController.register);

// Rota Login
router.post('/users/login', userController.login);
router.get('/users/logout', userController.logout);

module.exports = router;
