import { Router } from "express";
import * as controller from '../controllers/device.controller'

const router = Router();

router.get('/', controller.getDevices);
router.get('/:id', controller.getDeviceById);
router.post('/', controller.createDevice);
router.put('/:id', controller.updateDevice);
router.delete('/:id', controller.removeDevice);

export default router;