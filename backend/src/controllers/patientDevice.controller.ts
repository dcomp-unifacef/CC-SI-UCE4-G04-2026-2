import { type Request, type Response, type NextFunction } from 'express';
import * as service from '../services/patientDevice.service';

export async function getPatientDevices(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientDevices = await service.findAll();
    res.json(patientDevices);
  } catch (e) {
    next(e);
  }
}

export async function getPatientDeviceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientDevice = await service.findById(String(req.params.id));
    res.json(patientDevice);
  } catch (e) {
    next(e)
  }
}

export async function createPatientDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientDevice = await service.create(req.body);
    res.status(201).json(patientDevice);
  } catch (e) {
    next(e)
  }
}

export async function updatePatientDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientDevice = await service.update(String(req.params.id), { ...req.body });
    res.json(patientDevice);
  } catch (e) {
    next(e)
  }
}

export async function removePatientDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.remove(String(req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e)
  }
}
