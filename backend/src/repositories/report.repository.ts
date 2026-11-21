import { prisma } from '../db/prisma';
import type { Prisma } from '../generated/prisma/client';

const safeReportSelect = {
  id: true,
  patientId: true,
  platform: true,
  periodStart: true,
  periodEnd: true,
  status: true,
  matchStatus: true,
  originalName: true,
  mimeType: true,
  sizeBytes: true,
  matchIdentifier: true,
  extractedAt: true,
  approvedAt: true,
  failureReason: true,
  createdAt: true,
  updatedAt: true,
  patient: { select: { id: true, fullName: true, phone: true, status: true } },
  metrics: true,
} satisfies Prisma.PatientReportSelect;

export const findMany = (
  where: Prisma.PatientReportWhereInput,
  skip: number,
  take: number,
) =>
  prisma.patientReport.findMany({
    where,
    select: safeReportSelect,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

export const count = (where: Prisma.PatientReportWhereInput) =>
  prisma.patientReport.count({ where });
export const findById = (id: string) =>
  prisma.patientReport.findUnique({ where: { id }, select: safeReportSelect });
export const findRawById = (id: string) =>
  prisma.patientReport.findUnique({ where: { id } });
