import { Router } from 'express';
import { BackupController } from '../controllers/BackupController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const ctrl = new BackupController();

router.use(authMiddleware);
router.get('/history',              ctrl.getHistory);
router.post('/full/:dbId',          ctrl.runFull);
router.post('/diff/:dbId',          ctrl.runDiff);
router.post('/incremental/:dbId',   ctrl.runIncremental);
router.get('/tree/:dbId',           ctrl.getTree);
router.post('/snapshot/:dbId',      ctrl.createSnapshot);
router.post('/simulate-disaster',   ctrl.simulateDisaster);
router.post('/restore/:id',         ctrl.restoreBackup);
router.get('/sla',                  ctrl.getSla);

export default router;
