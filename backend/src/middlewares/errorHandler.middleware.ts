import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { BadRequestError } from '../errors/BadRequestError';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            message: err.message,
            status: err.statusCode,
            ...(err instanceof BadRequestError ? { details: err.errors } : {})
        });

        return;
    }

    console.error('[Unexpected Error]:', err);

    res.status(500).json({
        message: 'Internal Server Error',
        status: 500
    });
}