import { type NextFunction, type Request, type Response } from 'express';
import * as service from '../services/system-setting.service';
import { getRouteParam } from '../middlewares/validator.middleware';

export async function getSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ settings: await service.getSettings() });
  } catch (error) {
    next(error);
  }
}
export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res.json({
      settings: await service.updateSettings(req.body, req.auth.userId),
    });
  } catch (error) {
    next(error);
  }
}
export async function listPortals(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ portals: await service.listPortals() });
  } catch (error) {
    next(error);
  }
}
export async function updatePortal(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res.json({
      portal: await service.updatePortal(
        getRouteParam(req, 'platform') as never,
        req.body.isEnabled,
        req.auth.userId,
      ),
    });
  } catch (error) {
    next(error);
  }
}
