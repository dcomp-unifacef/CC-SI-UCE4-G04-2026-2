import { type NextFunction, type Request, type Response } from 'express';
import * as service from '../services/dashboard.service';

export async function summary(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await service.summary());
  } catch (error) {
    next(error);
  }
}
