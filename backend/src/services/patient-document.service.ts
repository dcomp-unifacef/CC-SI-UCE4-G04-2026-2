import { prisma } from '../db/prisma';
import type { DocumentType } from '../generated/prisma/enums';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import {
  checksum,
  readPrivatePdf,
  removePrivatePdf,
  savePrivatePdf,
} from './private-file.service';
import { recordAudit } from './audit.service';
import * as repository from '../repositories/patient-document.repository';

export async function list(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });
  if (!patient) throw new NotFoundError('Patient not found');
  return repository.findByPatient(patientId);
}

export async function upload(
  patientId: string,
  type: DocumentType,
  file: Express.Request['uploads'] extends (infer T)[] | undefined ? T : never,
  actorId: string,
) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });
  if (!patient) throw new NotFoundError('Patient not found');
  const duplicate = await prisma.patientDocument.findFirst({
    where: { patientId, sha256: checksum(file.buffer) },
    select: { id: true },
  });
  if (duplicate)
    throw new ConflictError(
      'This document has already been uploaded for this patient',
    );
  const stored = await savePrivatePdf(file.buffer);
  try {
    const document = await prisma.patientDocument.create({
      data: {
        patientId,
        type,
        originalName: file.originalName,
        storageKey: stored.storageKey,
        mimeType: file.mimeType,
        sizeBytes: file.buffer.length,
        sha256: stored.sha256,
        uploadedById: actorId,
      },
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
    await recordAudit({
      actorId,
      patientId,
      entityType: 'PatientDocument',
      entityId: document.id,
      action: 'UPLOADED',
      fields: ['document'],
    });
    return document;
  } catch (error) {
    await removePrivatePdf(stored.storageKey);
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      throw new ConflictError(
        'This document has already been uploaded for this patient',
      );
    }
    throw error;
  }
}

export async function download(patientId: string, documentId: string) {
  const document = await repository.findById(patientId, documentId);
  if (!document) throw new NotFoundError('Patient document not found');
  return {
    document: {
      id: document.id,
      originalName: document.originalName,
      mimeType: document.mimeType,
    },
    buffer: await readPrivatePdf(document.storageKey),
  };
}
