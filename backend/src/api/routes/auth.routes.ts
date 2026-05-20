import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();
const ctrl = new AuthController();

router.post('/login',   authRateLimiter, ctrl.handleLogin);
router.post('/logout',  authMiddleware,  ctrl.handleLogout);
router.post('/refresh',                  ctrl.handleRefresh);
router.get('/me',       authMiddleware,  ctrl.handleMe);

export default router;
