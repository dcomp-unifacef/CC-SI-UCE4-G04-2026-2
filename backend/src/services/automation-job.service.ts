import { Prisma } from '../generated/prisma/client';
import { prisma } from '../db/prisma';
import type { JobQueryInput } from '../dto/automation/job-query.dto';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { recordAudit } from './audit.service';
import * as repository from '../repositories/automation-job.repository';

export async function list(query: JobQueryInput) {
  const where: Prisma.AutomationJobWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.patientId) where.patientId = query.patientId;
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
  const job = await repository.findById(id);
  if (!job) throw new NotFoundError('Automation job not found');
  return job;
}

export async function retry(id: string, actorId: string) {
  const job = await repository.findById(id);
  if (!job) throw new NotFoundError('Automation job not found');
  if (job.status !== 'FAILED')
    throw new ConflictError('Only failed automation jobs can be retried');
  if (job.attempts >= job.maxAttempts)
    throw new ConflictError('The maximum retry count has been reached');
  const updated = await prisma.automationJob.update({
    where: { id },
    data: {
      status: 'QUEUED',
      scheduledAt: new Date(),
      startedAt: null,
      finishedAt: null,
      errorCode: null,
      errorMessage: null,
    },
    select: { id: true, type: true, status: true, scheduledAt: true },
  });
  if (job.patientId)
    await recordAudit({
      actorId,
      patientId: job.patientId,
      entityType: 'AutomationJob',
      entityId: id,
      action: 'RETRY_QUEUED',
      fields: ['status'],
    });
  return updated;
}
