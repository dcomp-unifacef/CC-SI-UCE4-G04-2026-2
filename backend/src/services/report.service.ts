import { Prisma } from '../generated/prisma/client';
import { prisma } from '../db/prisma';
import type { ReportImportInput } from '../dto/report/report-import.dto';
import type { ReportMetricsInput } from '../dto/report/report-metrics.dto';
import type { ReportQueryInput } from '../dto/report/report-query.dto';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import {
  checksum,
  readPrivatePdf,
  removePrivatePdf,
  savePrivatePdf,
} from './private-file.service';
import { findPatientMatch } from './pdf-match.service';
import { recordAudit } from './audit.service';
import * as repository from '../repositories/report.repository';

export async function list(query: ReportQueryInput) {
  const where: Prisma.PatientReportWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.matchStatus) where.matchStatus = query.matchStatus;
  if (query.platform) where.platform = query.platform;
  if (query.patientId) where.patientId = query.patientId;
  if (query.periodFrom || query.periodTo)
    where.periodStart = {
      ...(query.periodFrom ? { gte: query.periodFrom } : {}),
      ...(query.periodTo ? { lte: query.periodTo } : {}),
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
  const report = await repository.findById(id);
  if (!report) throw new NotFoundError('Report not found');
  return report;
}

export async function importFiles(
  files: NonNullable<Express.Request['uploads']>,
  fields: ReportImportInput,
  actorId: string,
) {
  const results = [];
  for (const file of files) {
    const match = await findPatientMatch(file.buffer);
    const duplicate = await prisma.patientReport.findUnique({
      where: { sha256: checksum(file.buffer) },
    });
    if (duplicate) {
      results.push({
        file: file.originalName,
        status: 'DUPLICATE',
        reportId: duplicate.id,
      });
      continue;
    }
    const stored = await savePrivatePdf(file.buffer);
    try {
      const matchStatus = match.matchStatus;
      const status =
        matchStatus === 'MATCHED' ? 'REVIEW_REQUIRED' : 'AWAITING_MATCH';
      const report = await prisma.patientReport.create({
        data: {
          platform: fields.platform,
          ...(fields.periodStart ? { periodStart: fields.periodStart } : {}),
          ...(fields.periodEnd ? { periodEnd: fields.periodEnd } : {}),
          status,
          matchStatus,
          ...(match.patientId ? { patientId: match.patientId } : {}),
          ...(match.identifier ? { matchIdentifier: match.identifier } : {}),
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
          platform: true,
          periodStart: true,
          periodEnd: true,
          status: true,
          matchStatus: true,
          originalName: true,
        },
      });
      if (report.patientId)
        await recordAudit({
          actorId,
          patientId: report.patientId,
          entityType: 'PatientReport',
          entityId: report.id,
          action: 'AUTO_MATCHED',
          fields: ['patientId', 'matchStatus'],
        });
      results.push({
        file: file.originalName,
        status:
          matchStatus === 'MATCHED'
            ? 'ASSOCIATED_REVIEW_REQUIRED'
            : matchStatus,
        report,
      });
    } catch (error) {
      await removePrivatePdf(stored.storageKey);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        results.push({ file: file.originalName, status: 'DUPLICATE' });
      } else {
        results.push({ file: file.originalName, status: 'FAILED' });
      }
    }
  }
  return { results };
}

export async function associate(
  id: string,
  patientId: string,
  actorId: string,
) {
  const report = await repository.findRawById(id);
  if (!report) throw new NotFoundError('Report not found');
  if (report.status === 'SENT' || report.status === 'APPROVED')
    throw new ConflictError('Approved or sent reports cannot be reassociated');
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new NotFoundError('Patient not found');
  const updated = await prisma.patientReport.update({
    where: { id },
    data: {
      patientId,
      matchStatus: 'MANUAL',
      status:
        report.status === 'AWAITING_MATCH' ? 'REVIEW_REQUIRED' : report.status,
    },
    select: { id: true, patientId: true, status: true, matchStatus: true },
  });
  await recordAudit({
    actorId,
    patientId,
    entityType: 'PatientReport',
    entityId: id,
    action: 'MANUALLY_ASSOCIATED',
    fields: ['patientId', 'matchStatus'],
  });
  return updated;
}

export async function updateMetrics(
  id: string,
  data: ReportMetricsInput,
  actorId: string,
) {
  const report = await repository.findRawById(id);
  if (!report) throw new NotFoundError('Report not found');
  if (report.status === 'SENT')
    throw new ConflictError('Metrics for a sent report cannot be edited');
  const metrics = await prisma.$transaction(async (tx) => {
    await tx.reportMetric.deleteMany({ where: { reportId: id } });
    if (data.metrics.length)
      await tx.reportMetric.createMany({
        data: data.metrics.map((metric) => ({
          reportId: id,
          key: metric.key,
          ...(metric.value !== undefined
            ? { value: new Prisma.Decimal(metric.value) }
            : {}),
          ...(metric.valueText ? { valueText: metric.valueText } : {}),
          ...(metric.unit ? { unit: metric.unit } : {}),
          ...(metric.sourceLabel ? { sourceLabel: metric.sourceLabel } : {}),
        })),
      });
    await tx.patientReport.update({
      where: { id },
      data: {
        extractedAt: new Date(),
        status: report.patientId ? 'REVIEW_REQUIRED' : 'AWAITING_MATCH',
      },
    });
    return tx.reportMetric.findMany({
      where: { reportId: id },
      orderBy: { key: 'asc' },
    });
  });
  if (report.patientId)
    await recordAudit({
      actorId,
      patientId: report.patientId,
      entityType: 'PatientReport',
      entityId: id,
      action: 'METRICS_UPDATED',
      fields: ['metrics'],
    });
  return metrics;
}

export async function approve(id: string, actorId: string) {
  const report = await repository.findRawById(id);
  if (!report) throw new NotFoundError('Report not found');
  if (!report.patientId || !['MATCHED', 'MANUAL'].includes(report.matchStatus))
    throw new ConflictError(
      'Associate and verify the patient before approving this report',
    );
  if (!report.periodStart || !report.periodEnd)
    throw new ConflictError('Set the report period before approving');
  if (report.status !== 'REVIEW_REQUIRED')
    throw new ConflictError('Only reports requiring review can be approved');
  const updated = await prisma.patientReport.update({
    where: { id },
    data: { status: 'APPROVED', approvedAt: new Date(), approvedById: actorId },
    select: { id: true, patientId: true, status: true, approvedAt: true },
  });
  await recordAudit({
    actorId,
    patientId: report.patientId,
    entityType: 'PatientReport',
    entityId: id,
    action: 'APPROVED',
    fields: ['status', 'approvedAt'],
  });
  return updated;
}

export async function retry(id: string, actorId: string) {
  const report = await repository.findRawById(id);
  if (!report) throw new NotFoundError('Report not found');
  if (report.status !== 'FAILED')
    throw new ConflictError('Only failed reports can be reprocessed');
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.patientReport.update({
      where: { id },
      data: { status: 'PROCESSING', failureReason: null },
      select: { id: true, status: true },
    });
    const job = await tx.automationJob.create({
      data: {
        type: 'REPORT_PROCESS',
        status: 'QUEUED',
        reportId: id,
        ...(report.patientId ? { patientId: report.patientId } : {}),
        payload: { requestedBy: actorId },
      },
      select: { id: true, status: true, type: true },
    });
    if (report.patientId)
      await tx.auditLog.create({
        data: {
          actorId,
          patientId: report.patientId,
          entityType: 'PatientReport',
          entityId: id,
          action: 'REPROCESS_QUEUED',
          fields: ['status'],
        },
      });
    return { report: updated, job };
  });
  return result;
}

export async function readFile(id: string) {
  const report = await repository.findRawById(id);
  if (!report) throw new NotFoundError('Report not found');
  return {
    report: {
      id: report.id,
      originalName: report.originalName,
      mimeType: report.mimeType,
    },
    buffer: await readPrivatePdf(report.storageKey),
  };
}
