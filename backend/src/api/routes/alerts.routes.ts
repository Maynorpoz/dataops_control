import { Router } from 'express';
import { AlertsController } from '../controllers/AlertsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const ctrl = new AlertsController();

router.use(authMiddleware);
router.get('/',                    ctrl.getAll);
router.get('/open',                ctrl.getOpen);
router.get('/rules',               ctrl.getRules);
router.put('/rules',               ctrl.updateRules);
router.put('/:id/acknowledge',     ctrl.acknowledge);
router.put('/:id/resolve',         ctrl.resolve);

export default router;
