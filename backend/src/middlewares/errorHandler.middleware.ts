import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client';
import { AppError } from '../errors/AppError';
import { BadRequestError } from '../errors/BadRequestError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      status: err.statusCode,
      ...(err instanceof BadRequestError ? { details: err.errors } : {}),
    });

    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res
        .status(409)
        .json({
          message: 'A record with these values already exists',
          status: 409,
        });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Record not found', status: 404 });
      return;
    }
    if (err.code === 'P2003') {
      res
        .status(409)
        .json({
          message: 'The record is referenced by another resource',
          status: 409,
        });
      return;
    }
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res
      .status(400)
      .json({ message: 'Malformed JSON request body', status: 400 });
    return;
  }

  console.error('[Unexpected Error]:', err.name);

  res.status(500).json({
    message: 'Internal Server Error',
    status: 500,
  });
}
