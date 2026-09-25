import { type Request, type Response, type NextFunction } from 'express';
import * as service from '../services/patient.service'

export async function getPatients(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patients = await service.findAll();
    res.json(patients);
  } catch (e) {
    next(e);
  }
}

export async function getPatientById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await service.findById(String(req.params.id));
    res.json(patient);
  } catch (e) {
    next(e)
  }
}

export async function createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await service.create(req.body);
    res.status(201).json(patient);
  } catch (e) {
    next(e)
  }
}

export async function updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await service.update(String(req.params.id), { ...req.body });
    res.json(patient);
  } catch (e) {
    next(e)
  }
}

export async function removePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.remove(String(req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e)
  }
}