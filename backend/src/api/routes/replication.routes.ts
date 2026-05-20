import { Router } from 'express';
import { ReplicationController } from '../controllers/ReplicationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const ctrl = new ReplicationController();

router.use(authMiddleware);
router.get('/status',              ctrl.getStatus);
router.get('/lag/history',         ctrl.getLagHistory);
router.post('/stress/:scenario',   ctrl.stressScenario);

export default router;
