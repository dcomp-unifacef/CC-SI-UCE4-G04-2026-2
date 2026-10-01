import { Router } from 'express';
import * as controller from '../controllers/user.controller';
import { validator } from '../middlewares/validator.middleware';
import { CreateUserDto } from '../dto/user/create.user.dto';
import { UpdateUserDto } from '../dto/user/update.user.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';

const router = Router();

router.get('/', controller.getUsers);
router.get('/:id', validator(IdParamDto, 'params'), controller.getUserById);
router.post('/', validator(CreateUserDto, 'body'), controller.createUser);
router.patch(
  '/:id',
  validator(IdParamDto, 'params'),
  validator(UpdateUserDto, 'body'),
  controller.updateUser,
);
router.delete(
  '/:id',
  validator(IdParamDto, 'params'),
  controller.removeUser,
);

export default router;
