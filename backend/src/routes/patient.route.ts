import { Router } from 'express';
import { CreatePatientDto } from '../dto/patient/create-patient.dto';
import { PatientDocumentParamDto } from '../dto/patient/patient-document-param.dto';
import { PatientQueryDto } from '../dto/patient/patient-query.dto';
import { UpdatePatientDto } from '../dto/patient/update-patient.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';
import * as controller from '../controllers/patient.controller';
import * as documentController from '../controllers/patient-document.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import express from 'express';
import { multipartFiles } from '../middlewares/private-upload.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', validator(PatientQueryDto, 'query'), controller.list);
router.post('/', validator(CreatePatientDto, 'body'), controller.create);
router.get(
  '/:id/documents',
  validator(IdParamDto, 'params'),
  documentController.list,
);
router.post(
  '/:id/documents',
  validator(IdParamDto, 'params'),
  express.raw({ type: 'multipart/form-data', limit: '22mb' }),
  multipartFiles('file', 1),
  documentController.upload,
);
router.get(
  '/:patientId/documents/:documentId/file',
  validator(PatientDocumentParamDto, 'params'),
  documentController.file,
);
router.get('/:id', validator(IdParamDto, 'params'), controller.get);
router.patch(
  '/:id',
  validator(IdParamDto, 'params'),
  validator(UpdatePatientDto, 'body'),
  controller.update,
);
router.delete('/:id', validator(IdParamDto, 'params'), controller.deactivate);
export default router;
