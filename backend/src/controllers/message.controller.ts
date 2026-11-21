import { type NextFunction, type Request, type Response } from 'express';
import * as service from '../services/message.service';
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
    res.json({ message: await service.findById(getRouteParam(req, 'id')) });
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res
      .status(201)
      .json({ message: await service.create(req.body, req.auth.userId) });
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
      .json(await service.retry(getRouteParam(req, 'id'), req.auth.userId));
  } catch (error) {
    next(error);
  }
}
