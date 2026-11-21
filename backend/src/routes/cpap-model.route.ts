import { Router } from 'express';
import { CreateCpapModelDto } from '../dto/cpap/create-cpap-model.dto';
import { CpapModelQueryDto } from '../dto/cpap/cpap-model-query.dto';
import { UpdateCpapModelDto } from '../dto/cpap/update-cpap-model.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';
import * as controller from '../controllers/cpap-model.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', validator(CpapModelQueryDto, 'query'), controller.list);
router.post('/', validator(CreateCpapModelDto, 'body'), controller.create);
router.get('/:id', validator(IdParamDto, 'params'), controller.get);
router.patch(
  '/:id',
  validator(IdParamDto, 'params'),
  validator(UpdateCpapModelDto, 'body'),
  controller.update,
);
router.delete('/:id', validator(IdParamDto, 'params'), controller.deactivate);
export default router;
