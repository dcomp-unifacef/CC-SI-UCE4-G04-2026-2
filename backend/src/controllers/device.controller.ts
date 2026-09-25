import { type Request, type Response, type NextFunction } from 'express';
import * as service from '../services/device.service'

export async function getDevices(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const devices = await service.findAll();
    res.json(devices);
  } catch (e) {
    next(e);
  }
}

export async function getDeviceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const device = await service.findById(String(req.params.id));
    res.json(device);
  } catch (e) {
    next(e)
  }
}

export async function createDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const device = await service.create(req.body);
    res.status(201).json(device);
  } catch (e) {
    next(e)
  }
}

export async function updateDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const device = await service.update(String(req.params.id), { ...req.body });
    res.json(device);
  } catch (e) {
    next(e)
  }
}

export async function removeDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.remove(String(req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e)
  }
}