import { prisma } from '../db/prisma';
import type { Prisma } from '../generated/prisma/client';

const select = {
  id: true,
  type: true,
  status: true,
  patientId: true,
  reportId: true,
  messageLogId: true,
  attempts: true,
  maxAttempts: true,
  scheduledAt: true,
  startedAt: true,
  finishedAt: true,
  errorCode: true,
  errorMessage: true,
  createdAt: true,
  updatedAt: true,
  patient: { select: { id: true, fullName: true } },
  report: {
    select: { id: true, originalName: true, platform: true, status: true },
  },
  messageLog: { select: { id: true, category: true, status: true } },
} satisfies Prisma.AutomationJobSelect;

export const findMany = (
  where: Prisma.AutomationJobWhereInput,
  skip: number,
  take: number,
) =>
  prisma.automationJob.findMany({
    where,
    select,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
export const count = (where: Prisma.AutomationJobWhereInput) =>
  prisma.automationJob.count({ where });
export const findById = (id: string) =>
  prisma.automationJob.findUnique({ where: { id }, select });
