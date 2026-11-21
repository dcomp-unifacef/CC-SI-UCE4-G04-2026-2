import { prisma } from '../db/prisma';

export const findByPatient = (patientId: string) =>
  prisma.patientDocument.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      patientId: true,
      type: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
  });

export const findById = (patientId: string, id: string) =>
  prisma.patientDocument.findFirst({ where: { id, patientId } });
