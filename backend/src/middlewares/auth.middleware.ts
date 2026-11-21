import { type NextFunction, type Request, type Response } from 'express';
import type { UserRole } from '../generated/prisma/enums';
import { ForbiddenError } from '../errors/ForbiddenError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { verifyAccessToken } from '../services/auth.service';

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      throw new UnauthorizedError('Bearer access token is required');
    const token = header.slice(7).trim();
    if (!token) throw new UnauthorizedError('Bearer access token is required');
    req.auth = await verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth)
      return next(new UnauthorizedError('Authentication is required'));
    if (!roles.includes(req.auth.role))
      return next(new ForbiddenError('Administrator permissions are required'));
    next();
  };
}
