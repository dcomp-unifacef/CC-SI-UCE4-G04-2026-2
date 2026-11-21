import { prisma } from '../db/prisma';
import type { Prisma } from '../generated/prisma/client';

export const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const findById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const create = (data: Prisma.UserCreateInput) =>
  prisma.user.create({ data });

export const update = (id: string, data: Prisma.UserUpdateInput) =>
  prisma.user.update({ where: { id }, data });
