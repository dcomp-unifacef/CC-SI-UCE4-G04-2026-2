import { prisma } from '../db/prisma';
import type { Prisma } from '../generated/prisma/client';

const safeMessageSelect = {
  id: true,
  patientId: true,
  reportId: true,
  templateId: true,
  channel: true,
  category: true,
  status: true,
  contentSnapshot: true,
  scheduledAt: true,
  sentAt: true,
  providerMessageId: true,
  attemptCount: true,
  errorCode: true,
  errorMessage: true,
  createdAt: true,
  updatedAt: true,
  patient: { select: { id: true, fullName: true, phone: true, status: true } },
  report: {
    select: {
      id: true,
      platform: true,
      periodStart: true,
      periodEnd: true,
      status: true,
      originalName: true,
    },
  },
  template: { select: { id: true, code: true, name: true } },
} satisfies Prisma.MessageLogSelect;

export const findMany = (
  where: Prisma.MessageLogWhereInput,
  skip: number,
  take: number,
) =>
  prisma.messageLog.findMany({
    where,
    select: safeMessageSelect,
    orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'desc' }],
    skip,
    take,
  });

export const count = (where: Prisma.MessageLogWhereInput) =>
  prisma.messageLog.count({ where });
export const findById = (id: string) =>
  prisma.messageLog.findUnique({ where: { id }, select: safeMessageSelect });
export const findRawById = (id: string) =>
  prisma.messageLog.findUnique({ where: { id }, include: { patient: true } });
