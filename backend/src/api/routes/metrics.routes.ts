import { Router } from 'express';
import { MetricsController } from '../controllers/MetricsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const ctrl = new MetricsController();

router.use(authMiddleware);
router.get('/dashboard',        ctrl.getDashboard);
router.get('/:dbId/history',    ctrl.getHistory);

export default router;
