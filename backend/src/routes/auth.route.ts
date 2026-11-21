import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { ChangePasswordDto } from '../dto/auth/change-password.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { requireAuth } from '../middlewares/auth.middleware';
import { authRateLimit } from '../middlewares/auth-rate-limit.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();

router.post(
  '/register',
  authRateLimit,
  validator(RegisterDto, 'body'),
  controller.register,
);
router.post(
  '/login',
  authRateLimit,
  validator(LoginDto, 'body'),
  controller.login,
);
router.post('/refresh', authRateLimit, controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);
router.patch(
  '/password',
  requireAuth,
  validator(ChangePasswordDto, 'body'),
  controller.changePassword,
);

export default router;
