import bcrypt from 'bcryptjs';
import { Prisma } from '../generated/prisma/client';
import { prisma } from '../db/prisma';
import { ConflictError } from '../errors/ConflictError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { NotFoundError } from '../errors/NotFoundError';
import type { CreateUserInput } from '../dto/auth/create-user.dto';
import type { UpdateUserInput } from '../dto/auth/update-user.dto';
import type { UserQueryInput } from '../dto/user/user-query.dto';
import * as repository from '../repositories/user.repository';
import { getPublicUser } from './user.util';
import { recordAudit } from './audit.service';

export async function list(query: UserQueryInput) {
  const where: Prisma.UserWhereInput = {};
  if (query.role) where.role = query.role;
  if (query.isActive !== undefined) where.isActive = query.isActive;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { username: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  return {
    data: users.map(getPublicUser),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

export async function findById(id: string) {
  const user = await repository.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return getPublicUser(user);
}

export async function create(data: CreateUserInput, actorId: string) {
  if (await repository.findByEmail(data.email))
    throw new ConflictError('Email already in use');
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await repository.create({
    name: data.name,
    email: data.email,
    ...(data.username ? { username: data.username } : {}),
    passwordHash,
    role: data.role,
  });
  await recordAudit({
    actorId,
    entityType: 'User',
    entityId: user.id,
    action: 'CREATED',
    fields: ['name', 'email', 'role'],
  });
  return getPublicUser(user);
}

async function ensureAnotherActiveAdmin(id: string) {
  const remaining = await prisma.user.count({
    where: { role: 'ADMIN', isActive: true, id: { not: id } },
  });
  if (remaining === 0)
    throw new ConflictError(
      'The last active administrator cannot be removed or demoted',
    );
}

export async function update(
  id: string,
  actorId: string,
  data: UpdateUserInput,
) {
  const current = await repository.findById(id);
  if (!current) throw new NotFoundError('User not found');
  if (id === actorId && (data.isActive === false || data.role === 'STAFF')) {
    throw new ForbiddenError(
      'You cannot deactivate or demote your own account',
    );
  }
  if (
    current.role === 'ADMIN' &&
    current.isActive &&
    (data.isActive === false || data.role === 'STAFF')
  ) {
    await ensureAnotherActiveAdmin(id);
  }
  const user = await repository.update(id, data as Prisma.UserUpdateInput);
  if (data.isActive === false) {
    await prisma.authSession.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await recordAudit({
    actorId,
    entityType: 'User',
    entityId: id,
    action: 'UPDATED',
    fields: Object.keys(data),
  });
  return getPublicUser(user);
}

export async function deactivate(id: string, actorId: string) {
  const current = await repository.findById(id);
  if (!current) throw new NotFoundError('User not found');
  if (id === actorId)
    throw new ForbiddenError('You cannot deactivate your own account');
  if (current.role === 'ADMIN' && current.isActive)
    await ensureAnotherActiveAdmin(id);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { isActive: false } }),
    prisma.authSession.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  await recordAudit({
    actorId,
    entityType: 'User',
    entityId: id,
    action: 'DEACTIVATED',
    fields: ['isActive'],
  });
}
