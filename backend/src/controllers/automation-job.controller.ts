import { type NextFunction, type Request, type Response } from 'express';
import * as service from '../services/automation-job.service';
import { getRouteParam } from '../middlewares/validator.middleware';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await service.list(req.query as never));
  } catch (error) {
    next(error);
  }
}
export async function get(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ job: await service.findById(getRouteParam(req, 'id')) });
  } catch (error) {
    next(error);
  }
}
export async function retry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res
      .status(202)
      .json({
        job: await service.retry(getRouteParam(req, 'id'), req.auth.userId),
      });
  } catch (error) {
    next(error);
  }
}
