import { Router } from "express";
import * as controller from '../controllers/patient.controller'

const router = Router();

router.get('/', controller.getPatients);
router.get('/:id', controller.getPatientById);
router.get('/:email', controller.getPatientByEmail);
router.post('/', controller.createPatient);
router.put('/:id', controller.updatePatient);
router.delete('/:id', controller.removePatient);

export default router;