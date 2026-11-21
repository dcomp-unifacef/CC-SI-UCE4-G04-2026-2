import { Router } from 'express';
import { JobQueryDto } from '../dto/automation/job-query.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';
import * as controller from '../controllers/automation-job.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', validator(JobQueryDto, 'query'), controller.list);
router.get('/:id', validator(IdParamDto, 'params'), controller.get);
router.post(
  '/:id/retry',
  requireRole('ADMIN'),
  validator(IdParamDto, 'params'),
  controller.retry,
);
export default router;
