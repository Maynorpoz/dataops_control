import { Router } from 'express';
import { ConcurrencyController } from '../controllers/ConcurrencyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const ctrl = new ConcurrencyController();

router.use(authMiddleware);
router.post('/simulate', ctrl.runSimulation);
router.get('/logs',      ctrl.getLogs);
router.get('/stats',     ctrl.getStats);

export default router;
