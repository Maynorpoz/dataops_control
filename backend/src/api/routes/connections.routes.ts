import { Router } from 'express';
import { ConnectionsController } from '../controllers/ConnectionsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const ctrl = new ConnectionsController();

router.use(authMiddleware);
router.get('/',          ctrl.getAll);
router.post('/',         ctrl.createOne);
router.get('/:id',       ctrl.getOne);
router.put('/:id',       ctrl.updateOne);
router.delete('/:id',    ctrl.deleteOne);
router.post('/:id/test', ctrl.testOne);

export default router;
