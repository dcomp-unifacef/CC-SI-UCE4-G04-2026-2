import { type NextFunction, type Request, type Response } from 'express';
import { BadRequestError } from '../errors/BadRequestError';

type ValidationTarget = 'body' | 'params' | 'query';
type ParsableDto = { parse(input: unknown): unknown };

export function validator(dtoClass: ParsableDto, target: ValidationTarget) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const value = dtoClass.parse(req[target]);
      Object.defineProperty(req, target, {
        value,
        configurable: true,
        enumerable: true,
        writable: true,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0)
    throw new BadRequestError(`Route parameter "${name}" is required`, []);
  return value;
}
