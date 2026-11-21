import { type NextFunction, type Request, type Response } from 'express';
import * as service from '../services/auth.service';
import { authConfig } from '../config/auth.config';

function requestMeta(req: Request) {
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');
  return {
    ...(ipAddress ? { ipAddress } : {}),
    ...(userAgent ? { userAgent } : {}),
  };
}

function cookieValue(req: Request): string | undefined {
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${authConfig.refreshCookieName}=`));
  if (!cookie) return undefined;
  return decodeURIComponent(
    cookie.slice(authConfig.refreshCookieName.length + 1),
  );
}

function setRefreshCookie(res: Response, token: string): void {
  const maxAge = authConfig.refreshTtlDays * 24 * 60 * 60;
  const secure = authConfig.cookieSecure ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${authConfig.refreshCookieName}=${encodeURIComponent(token)}; HttpOnly; Path=/auth; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  );
}

function clearRefreshCookie(res: Response): void {
  const secure = authConfig.cookieSecure ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${authConfig.refreshCookieName}=; HttpOnly; Path=/auth; SameSite=Lax; Max-Age=0${secure}`,
  );
}

function sendAuthResult(
  res: Response,
  result: Awaited<ReturnType<typeof service.login>>,
): void {
  setRefreshCookie(res, result.refreshToken);
  res.json({
    user: result.user,
    accessToken: result.accessToken,
    token: result.accessToken,
    expiresIn: result.expiresIn,
  });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.registerFirstAdmin(req.body, requestMeta(req));
    setRefreshCookie(res, result.refreshToken);
    res
      .status(201)
      .json({
        user: result.user,
        accessToken: result.accessToken,
        token: result.accessToken,
        expiresIn: result.expiresIn,
      });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendAuthResult(res, await service.login(req.body, requestMeta(req)));
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    sendAuthResult(res, await service.refresh(cookieValue(req)));
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await service.logout(req.auth?.sessionId, cookieValue(req));
    clearRefreshCookie(res);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res.json({ user: await service.getCurrentUser(req.auth.userId) });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    await service.changePassword(
      req.auth.userId,
      req.body.currentPassword,
      req.body.newPassword,
    );
    clearRefreshCookie(res);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
