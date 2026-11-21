import { type NextFunction, type Request, type Response } from 'express';
import * as service from '../services/template.service';
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
    res.json({ template: await service.findById(getRouteParam(req, 'id')) });
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
      .json({ template: await service.create(req.body, req.auth.userId) });
  } catch (error) {
    next(error);
  }
}
export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res.json({
      template: await service.update(
        getRouteParam(req, 'id'),
        req.body,
        req.auth.userId,
      ),
    });
  } catch (error) {
    next(error);
  }
}
export async function deactivate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    await service.deactivate(getRouteParam(req, 'id'), req.auth.userId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
