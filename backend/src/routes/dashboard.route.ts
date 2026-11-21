import { Router } from 'express';
import * as controller from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);
router.get('/summary', controller.summary);
export default router;
