import { Router } from 'express';
import { EvolutionTestMessageDto } from '../dto/evolution/test-message.dto';
import * as controller from '../controllers/evolution.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/status', controller.status);
router.post('/connect', controller.qr);
router.post(
  '/test-message',
  validator(EvolutionTestMessageDto, 'body'),
  controller.testMessage,
);
export default router;
