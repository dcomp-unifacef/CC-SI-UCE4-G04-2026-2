import { Router } from 'express';
import * as controller from '../controllers/patientDevice.controller';
import { validator } from '../middlewares/validator.middleware';
import { CreatePatientDeviceDto } from '../dto/patient-device/create.patientDevice.dto';
import { UpdatePatientDeviceDto } from '../dto/patient-device/update.patientDevice.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';

const router = Router();

router.get('/', controller.getPatientDevices);
router.get(
  '/:id',
  validator(IdParamDto, 'params'),
  controller.getPatientDeviceById,
);
router.post(
  '/',
  validator(CreatePatientDeviceDto, 'body'),
  controller.createPatientDevice,
);
router.patch(
  '/:id',
  validator(IdParamDto, 'params'),
  validator(UpdatePatientDeviceDto, 'body'),
  controller.updatePatientDevice,
);
router.delete(
  '/:id',
  validator(IdParamDto, 'params'),
  controller.removePatientDevice,
);

export default router;
