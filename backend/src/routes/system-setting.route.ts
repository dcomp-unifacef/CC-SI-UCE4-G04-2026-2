import { Router } from 'express';
import { PortalParamDto } from '../dto/system/portal-param.dto';
import { UpdatePortalSettingDto } from '../dto/system/update-portal-setting.dto';
import { UpdateSettingsDto } from '../dto/system/update-settings.dto';
import * as controller from '../controllers/system-setting.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', controller.getSettings);
router.patch(
  '/',
  validator(UpdateSettingsDto, 'body'),
  controller.updateSettings,
);
router.get('/portals', controller.listPortals);
router.patch(
  '/portals/:platform',
  validator(PortalParamDto, 'params'),
  validator(UpdatePortalSettingDto, 'body'),
  controller.updatePortal,
);
export default router;
