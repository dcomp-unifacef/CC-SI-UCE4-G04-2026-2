import { Router } from 'express';
import { CreateTemplateDto } from '../dto/template/create-template.dto';
import { TemplateQueryDto } from '../dto/template/template-query.dto';
import { UpdateTemplateDto } from '../dto/template/update-template.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';
import * as controller from '../controllers/template.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', validator(TemplateQueryDto, 'query'), controller.list);
router.get('/:id', validator(IdParamDto, 'params'), controller.get);
router.post(
  '/',
  requireRole('ADMIN'),
  validator(CreateTemplateDto, 'body'),
  controller.create,
);
router.patch(
  '/:id',
  requireRole('ADMIN'),
  validator(IdParamDto, 'params'),
  validator(UpdateTemplateDto, 'body'),
  controller.update,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validator(IdParamDto, 'params'),
  controller.deactivate,
);
export default router;
