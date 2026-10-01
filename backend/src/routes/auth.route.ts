import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { validator } from '../middlewares/validator.middleware';

const router = Router();

router.post(
  '/register',
  validator(RegisterDto, 'body'),
  controller.register
);

router.post('/login', validator(LoginDto, 'body'), controller.login);

export default router;
