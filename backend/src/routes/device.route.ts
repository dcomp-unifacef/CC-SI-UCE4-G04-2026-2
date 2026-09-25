import { Router } from "express";
import * as controller from '../controllers/device.controller'
import { validator } from "../middlewares/validator.middleware";
import { CreateDeviceDto } from "../dto/device/create.device.dto";
import { UpdateDeviceDto } from "../dto/device/update.device.dto";
import { IdParamDto } from "../dto/shared/id.param.dto";

const router = Router();

router.get('/', controller.getDevices);
router.get('/:id', validator(IdParamDto, 'params'), controller.getDeviceById);
router.post('/', validator(CreateDeviceDto, 'body'), controller.createDevice);
router.patch('/:id',
    validator(IdParamDto, 'params'),
    validator(UpdateDeviceDto, 'body'),
    controller.updateDevice
);
router.delete('/:id', validator(IdParamDto, 'params'), controller.removeDevice);

export default router;