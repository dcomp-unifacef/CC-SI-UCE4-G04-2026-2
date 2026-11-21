import { Router } from 'express';
import { CreateUserDto } from '../dto/auth/create-user.dto';
import { UpdateProfileDto } from '../dto/auth/update-profile.dto';
import { UpdateUserDto } from '../dto/auth/update-user.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';
import { UserQueryDto } from '../dto/user/user-query.dto';
import * as controller from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.get('/me', requireAuth, controller.me);
router.patch(
  '/me',
  requireAuth,
  validator(UpdateProfileDto, 'body'),
  controller.updateMe,
);
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', validator(UserQueryDto, 'query'), controller.list);
router.post('/', validator(CreateUserDto, 'body'), controller.create);
router.get('/:id', validator(IdParamDto, 'params'), controller.get);
router.patch(
  '/:id',
  validator(IdParamDto, 'params'),
  validator(UpdateUserDto, 'body'),
  controller.update,
);
router.delete('/:id', validator(IdParamDto, 'params'), controller.deactivate);
export default router;
