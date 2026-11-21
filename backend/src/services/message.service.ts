import { Prisma } from '../generated/prisma/client';
import { randomUUID } from 'node:crypto';
import { prisma } from '../db/prisma';
import type { CreateMessageInput } from '../dto/message/create-message.dto';
import type { MessageQueryInput } from '../dto/message/message-query.dto';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import * as repository from '../repositories/message.repository';

export async function list(query: MessageQueryInput) {
  const where: Prisma.MessageLogWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.category) where.category = query.category;
  if (query.patientId) where.patientId = query.patientId;
  if (query.from || query.to)
    where.createdAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to
        ? { lt: new Date(query.to.getTime() + 24 * 60 * 60 * 1000) }
        : {}),
    };
  const [data, total] = await Promise.all([
    repository.findMany(
      where,
      (query.page - 1) * query.pageSize,
      query.pageSize,
    ),
    repository.count(where),
  ]);
  return {
    data,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

export async function findById(id: string) {
  const message = await repository.findById(id);
  if (!message) throw new NotFoundError('Message not found');
  return message;
}

export async function create(data: CreateMessageInput, actorId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });
  if (!patient) throw new NotFoundError('Patient not found');
  if (patient.status !== 'ACTIVE')
    throw new ConflictError(
      'Messages cannot be scheduled for an inactive patient',
    );
  if (!patient.whatsappOptIn)
    throw new ConflictError('Patient has not opted in to WhatsApp messages');
  if (data.reportId) {
    const report = await prisma.patientReport.findUnique({
      where: { id: data.reportId },
    });
    if (!report || report.patientId !== patient.id)
      throw new ConflictError('Report does not belong to this patient');
    if (report.status !== 'APPROVED')
      throw new ConflictError('Report must be approved before it can be sent');
  }
  if (data.templateId) {
    const template = await prisma.messageTemplate.findUnique({
      where: { id: data.templateId },
    });
    if (!template || !template.isActive)
      throw new NotFoundError('Active message template not found');
  }
  const scheduledAt = data.scheduledAt ?? new Date();
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.messageLog.create({
      data: {
        patientId: data.patientId,
        category: data.category,
        contentSnapshot: data.content,
        status: 'SCHEDULED',
        channel: 'WHATSAPP',
        scheduledAt,
        idempotencyKey: randomUUID(),
        ...(data.templateId ? { templateId: data.templateId } : {}),
        ...(data.reportId ? { reportId: data.reportId } : {}),
      },
      select: {
        id: true,
        patientId: true,
        reportId: true,
        templateId: true,
        category: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
      },
    });
    await tx.automationJob.create({
      data: {
        type: data.reportId ? 'REPORT_SEND' : 'MESSAGE_SEND',
        status: 'QUEUED',
        patientId: data.patientId,
        ...(data.reportId ? { reportId: data.reportId } : {}),
        messageLogId: created.id,
        scheduledAt,
        payload: { source: 'manual', requestedBy: actorId },
      },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        patientId: patient.id,
        entityType: 'MessageLog',
        entityId: created.id,
        action: 'SCHEDULED',
        fields: ['category', 'scheduledAt'],
      },
    });
    return created;
  });
  return message;
}

export async function retry(id: string, actorId: string) {
  const message = await repository.findRawById(id);
  if (!message) throw new NotFoundError('Message not found');
  if (message.status !== 'FAILED')
    throw new ConflictError('Only failed messages can be retried');
  if (message.patient.status !== 'ACTIVE' || !message.patient.whatsappOptIn) {
    throw new ConflictError(
      'Patient is inactive or has opted out of WhatsApp messages',
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.messageLog.update({
      where: { id },
      data: {
        status: 'PENDING',
        errorCode: null,
        errorMessage: null,
        scheduledAt: new Date(),
      },
      select: {
        id: true,
        patientId: true,
        status: true,
        category: true,
        scheduledAt: true,
      },
    });
    const job = await tx.automationJob.create({
      data: {
        type: 'MESSAGE_SEND',
        status: 'QUEUED',
        patientId: message.patientId,
        messageLogId: id,
        payload: { requestedBy: actorId },
      },
      select: { id: true, type: true, status: true, createdAt: true },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        patientId: message.patientId,
        entityType: 'MessageLog',
        entityId: id,
        action: 'RETRY_QUEUED',
        fields: ['status'],
      },
    });
    return { message: updated, job };
  });
  return result;
}
