import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: {
                message: err.message,
                status: err.statusCode
            }
        });

        return;
    }

    console.error('[Unexpected Error]:', err);

    res.status(500).json({
        error: {
            message: 'Internal Server Error',
            status: 500
        }
    });
}