import { type Request, type Response, type NextFunction } from 'express';
import * as service from '../services/auth.service';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.register(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
