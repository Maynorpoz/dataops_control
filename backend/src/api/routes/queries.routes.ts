import { Router } from 'express';
import { QueriesController } from '../controllers/QueriesController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const ctrl = new QueriesController();

router.use(authMiddleware);
router.get('/',                  ctrl.getAll);
router.get('/top-slow',          ctrl.getTopSlow);
router.post('/capture/:dbId',    ctrl.captureFromDb);
router.get('/:id/plan',          ctrl.getPlan);

export default router;
