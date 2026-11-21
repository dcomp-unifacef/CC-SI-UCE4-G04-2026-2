import { prisma } from '../db/prisma';
import type { Prisma } from '../generated/prisma/client';

export const findMany = (
  where: Prisma.MessageTemplateWhereInput,
  skip: number,
  take: number,
) =>
  prisma.messageTemplate.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    skip,
    take,
  });

export const count = (where: Prisma.MessageTemplateWhereInput) =>
  prisma.messageTemplate.count({ where });
export const findById = (id: string) =>
  prisma.messageTemplate.findUnique({ where: { id } });
export const create = (data: Prisma.MessageTemplateCreateInput) =>
  prisma.messageTemplate.create({ data });
export const update = (id: string, data: Prisma.MessageTemplateUpdateInput) =>
  prisma.messageTemplate.update({ where: { id }, data });
