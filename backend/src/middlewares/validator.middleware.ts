import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestError } from '../errors/BadRequestError';

type ValidationTarget = 'body' | 'params' | 'query';

export function validator(dtoClass: any, target: ValidationTarget) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToInstance(dtoClass, req[target]);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        const formattedErrors = errors.map((err) => {
          return {
            field: err.property,
            rule: Object.values(err.constraints || {}),
          };
        });

        throw new BadRequestError(`Invalid request ${target}`, formattedErrors);
      }

      req[target] = dtoInstance;
      next();
    } catch (e) {
      next(e);
    }
  };
}
