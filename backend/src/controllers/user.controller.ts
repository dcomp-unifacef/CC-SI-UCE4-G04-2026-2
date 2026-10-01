import { type Request, type Response, type NextFunction } from 'express';
import * as service from '../services/user.service'

export async function getUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await service.findAll();
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await service.findById(String(req.params.id));
    res.json(user);
  } catch (e) {
    next(e)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await service.create(req.body);
    res.status(201).json(user);
  } catch (e) {
    next(e)
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await service.update(String(req.params.id), { ...req.body });
    res.json(user);
  } catch (e) {
    next(e)
  }
}

export async function removeUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.remove(String(req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e)
  }
}