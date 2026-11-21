import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { Prisma, type User, type UserRole } from '../generated/prisma/client';
import { prisma } from '../db/prisma';
import { getPublicUser, type PublicUser } from './user.util';
import { authConfig } from '../config/auth.config';
import { ForbiddenError } from '../errors/ForbiddenError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import type { LoginInput } from '../dto/auth/login.dto';
import type { RegisterInput } from '../dto/auth/register.dto';

export type AuthResult = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

type RequestMeta = { ipAddress?: string; userAgent?: string };

const hashRefreshToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

function createAccessToken(user: User, sessionId: string): string {
  const options: SignOptions = {
    expiresIn: authConfig.accessExpiresIn as NonNullable<
      SignOptions['expiresIn']
    >,
  };
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, sid: sessionId },
    authConfig.accessSecret,
    options,
  );
}

async function createSession(
  user: User,
  meta: RequestMeta,
): Promise<AuthResult> {
  const refreshToken = randomBytes(48).toString('base64url');
  const refreshExpiresAt = new Date(
    Date.now() + authConfig.refreshTtlDays * 24 * 60 * 60 * 1000,
  );
  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshExpiresAt,
      ...(meta.ipAddress ? { ipAddress: meta.ipAddress.slice(0, 64) } : {}),
      ...(meta.userAgent ? { userAgent: meta.userAgent.slice(0, 512) } : {}),
    },
  });
  return {
    user: getPublicUser(user),
    accessToken: createAccessToken(user, session.id),
    refreshToken,
    expiresIn: authConfig.accessExpiresIn,
  };
}

export async function registerFirstAdmin(
  data: RegisterInput,
  meta: RequestMeta,
): Promise<AuthResult> {
  let user: User;
  try {
    user = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.user.count();
        if (existing > 0)
          throw new ForbiddenError(
            'Public registration is closed; ask an administrator to create an account',
          );
        return tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            ...(data.username ? { username: data.username } : {}),
            passwordHash: await bcrypt.hash(data.password, 12),
            role: 'ADMIN',
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof ForbiddenError) throw error;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      throw new ForbiddenError(
        'Another administrator was registered first; public registration is now closed',
      );
    }
    throw error;
  }
  return createSession(user, meta);
}

export async function login(
  data: LoginInput,
  meta: RequestMeta,
): Promise<AuthResult> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.email }],
    },
  });
  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(data.password, user.passwordHash))
  ) {
    throw new UnauthorizedError('Invalid credentials');
  }
  return createSession(user, meta);
}

export async function refresh(
  refreshToken: string | undefined,
): Promise<AuthResult> {
  if (!refreshToken)
    throw new UnauthorizedError('Refresh session is missing or expired');
  const tokenHash = hashRefreshToken(refreshToken);
  const replacement = randomBytes(48).toString('base64url');
  const replacementHash = hashRefreshToken(replacement);
  const now = new Date();
  const session = await prisma.authSession.findUnique({
    where: { refreshTokenHash: tokenHash },
    include: { user: true },
  });
  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= now ||
    !session.user.isActive
  ) {
    throw new UnauthorizedError('Refresh session is invalid or expired');
  }
  const expiresAt = new Date(
    now.getTime() + authConfig.refreshTtlDays * 24 * 60 * 60 * 1000,
  );
  const rotated = await prisma.authSession.updateMany({
    where: {
      id: session.id,
      refreshTokenHash: tokenHash,
      revokedAt: null,
      expiresAt: { gt: now },
    },
    data: { refreshTokenHash: replacementHash, expiresAt, lastUsedAt: now },
  });
  if (rotated.count !== 1)
    throw new UnauthorizedError('Refresh token was already used');
  return {
    user: getPublicUser(session.user),
    accessToken: createAccessToken(session.user, session.id),
    refreshToken: replacement,
    expiresIn: authConfig.accessExpiresIn,
  };
}

export async function logout(
  sessionId?: string,
  refreshToken?: string,
): Promise<void> {
  const where = sessionId
    ? { id: sessionId }
    : refreshToken
      ? { refreshTokenHash: hashRefreshToken(refreshToken) }
      : undefined;
  if (!where) return;
  await prisma.authSession.updateMany({
    where: { ...where, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function findActiveSession(sessionId: string, userId: string) {
  return prisma.authSession.findFirst({
    where: {
      id: sessionId,
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
      user: { isActive: true },
    },
    include: { user: true },
  });
}

export async function verifyAccessToken(
  token: string,
): Promise<{
  userId: string;
  sessionId: string;
  email: string;
  role: UserRole;
}> {
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, authConfig.accessSecret);
  } catch {
    throw new UnauthorizedError('Access token is invalid or expired');
  }
  if (
    typeof decoded === 'string' ||
    !decoded.sub ||
    typeof decoded.sid !== 'string'
  ) {
    throw new UnauthorizedError('Access token is invalid');
  }
  const session = await findActiveSession(decoded.sid, decoded.sub);
  if (!session)
    throw new UnauthorizedError('Session has expired or was revoked');
  return {
    userId: session.user.id,
    sessionId: session.id,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findFirst({
    where: { id: userId, isActive: true },
  });
  if (!user) throw new UnauthorizedError('User is inactive');
  return getPublicUser(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(currentPassword, user.passwordHash))
  ) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        actorId: userId,
        entityType: 'User',
        entityId: userId,
        action: 'PASSWORD_CHANGED',
        fields: ['passwordHash'],
      },
    }),
  ]);
}
