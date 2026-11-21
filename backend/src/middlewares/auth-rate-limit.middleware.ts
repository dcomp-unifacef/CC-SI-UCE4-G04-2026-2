import { type NextFunction, type Request, type Response } from 'express';
import { TooManyRequestsError } from '../errors/TooManyRequestsError';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 20;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function authRateLimit(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const now = Date.now();
  const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }
  current.count += 1;
  if (current.count > MAX_REQUESTS) {
    next(
      new TooManyRequestsError(
        'Too many authentication attempts. Try again later.',
      ),
    );
    return;
  }
  next();
}
