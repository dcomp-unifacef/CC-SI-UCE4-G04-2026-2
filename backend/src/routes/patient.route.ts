import { Router } from "express";
import * as controller from '../controllers/patient.controller'
import { validator } from "../middlewares/validator.middleware";
import { CreatePatientDto } from "../dto/patient/create.patient.dto";
import { UpdatePatientDto } from "../dto/patient/update.patient.dto";
import { IdParamDto } from "../dto/shared/id.param.dto";

const router = Router();

router.get('/', controller.getPatients);
router.get('/:id', validator(IdParamDto, 'params'), controller.getPatientById);
router.post('/', validator(CreatePatientDto, 'body'), controller.createPatient);
router.patch('/:id',
    validator(IdParamDto, 'params'),
    validator(UpdatePatientDto, 'body'),
    controller.updatePatient
);
router.delete('/:id', validator(IdParamDto, 'params'), controller.removePatient);

export default router;