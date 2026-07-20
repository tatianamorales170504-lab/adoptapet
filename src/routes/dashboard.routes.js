import { Router } from 'express';
import { getDashboardStats } from '../controladores/dashboardCtrl.js';

const router = Router();

router.get('/stats', getDashboardStats);

export default router;