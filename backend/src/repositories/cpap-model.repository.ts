import { prisma } from '../db/prisma';
import type { Prisma } from '../generated/prisma/client';

export const findMany = (
  where: Prisma.CpapModelWhereInput,
  skip: number,
  take: number,
) =>
  prisma.cpapModel.findMany({
    where,
    orderBy: [{ manufacturer: 'asc' }, { model: 'asc' }],
    skip,
    take,
  });

export const count = (where: Prisma.CpapModelWhereInput) =>
  prisma.cpapModel.count({ where });

export const findById = (id: string) =>
  prisma.cpapModel.findUnique({ where: { id } });

export const create = (data: Prisma.CpapModelCreateInput) =>
  prisma.cpapModel.create({ data });

export const update = (id: string, data: Prisma.CpapModelUpdateInput) =>
  prisma.cpapModel.update({ where: { id }, data });
