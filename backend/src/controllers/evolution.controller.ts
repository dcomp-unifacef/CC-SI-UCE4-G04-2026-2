import { type NextFunction, type Request, type Response } from 'express';
import * as service from '../services/evolution.service';

export async function status(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await service.connectionStatus());
  } catch (error) {
    next(error);
  }
}

export async function qr(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res.setHeader('Cache-Control', 'no-store');
    res.json(await service.createPairingQr(req.auth.userId));
  } catch (error) {
    next(error);
  }
}

export async function testMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res
      .status(202)
      .json(
        await service.sendTestMessage(
          req.body.recipient,
          req.body.message,
          req.auth.userId,
        ),
      );
  } catch (error) {
    next(error);
  }
}
