import { prisma } from '../db/prisma';
import type { Prisma } from '../generated/prisma/client';

export function findMany(
  where: Prisma.PatientWhereInput,
  skip: number,
  take: number,
) {
  return prisma.patient.findMany({
    where,
    orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
    skip,
    take,
    include: { cpapModel: true },
  });
}

export function count(where: Prisma.PatientWhereInput) {
  return prisma.patient.count({ where });
}

export function findById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      cpapModel: true,
      documents: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          platform: true,
          periodStart: true,
          periodEnd: true,
          status: true,
          matchStatus: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          extractedAt: true,
          approvedAt: true,
          createdAt: true,
          metrics: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          category: true,
          status: true,
          channel: true,
          contentSnapshot: true,
          scheduledAt: true,
          sentAt: true,
          attemptCount: true,
          errorCode: true,
          errorMessage: true,
          createdAt: true,
          reportId: true,
          templateId: true,
        },
      },
      auditEvents: { orderBy: { createdAt: 'desc' }, take: 100 },
    },
  });
}

export function findCpapModel(id: string) {
  return prisma.cpapModel.findUnique({ where: { id } });
}

export function create(data: Prisma.PatientUncheckedCreateInput) {
  return prisma.patient.create({ data, include: { cpapModel: true } });
}

export function update(id: string, data: Prisma.PatientUncheckedUpdateInput) {
  return prisma.patient.update({
    where: { id },
    data,
    include: { cpapModel: true },
  });
}
