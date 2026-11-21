import { Prisma } from '../generated/prisma/client';
import { prisma } from '../db/prisma';
import { NotFoundError } from '../errors/NotFoundError';
import type { CreatePatientInput } from '../dto/patient/create-patient.dto';
import type { PatientQueryInput } from '../dto/patient/patient-query.dto';
import type { UpdatePatientInput } from '../dto/patient/update-patient.dto';
import * as repository from '../repositories/patient.repository';
import { recordAudit } from './audit.service';
import { compactUndefined } from '../utils/object.util';

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function makeWhere(query: PatientQueryInput): Prisma.PatientWhereInput {
  const where: Prisma.PatientWhereInput = {};
  if (query.status !== 'ALL') where.status = query.status;
  if (query.cpapModelId) where.cpapModelId = query.cpapModelId;
  if (query.filterType) where.filterType = query.filterType;
  if (query.reportPlatform) where.reportPlatform = query.reportPlatform;
  if (query.maskModel)
    where.maskModel = { contains: query.maskModel, mode: 'insensitive' };
  if (query.physicianName)
    where.physicianName = {
      contains: query.physicianName,
      mode: 'insensitive',
    };
  if (query.therapyStartFrom || query.therapyStartTo) {
    where.therapyStartDate = {
      ...(query.therapyStartFrom ? { gte: query.therapyStartFrom } : {}),
      ...(query.therapyStartTo ? { lte: query.therapyStartTo } : {}),
    };
  }
  if (query.minAge !== undefined || query.maxAge !== undefined) {
    const today = new Date();
    const ageRange: Prisma.DateTimeNullableFilter<'Patient'> = {};
    if (query.minAge !== undefined)
      ageRange.lte = addYears(today, -query.minAge);
    if (query.maxAge !== undefined)
      ageRange.gte = addDays(addYears(today, -(query.maxAge + 1)), 1);
    where.birthDate = ageRange;
  }
  if (query.search) {
    const search = query.search.trim();
    const digits = search.replace(/\D/g, '');
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { cpapSerialNumber: { contains: search, mode: 'insensitive' } },
      ...(digits
        ? [{ cpf: { contains: digits } }]
        : [{ cpf: { contains: search } }]),
    ];
  }
  return where;
}

function calculateAge(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export async function list(query: PatientQueryInput) {
  const where = makeWhere(query);
  const [patients, total] = await Promise.all([
    repository.findMany(
      where,
      (query.page - 1) * query.pageSize,
      query.pageSize,
    ),
    repository.count(where),
  ]);
  return {
    data: patients.map((patient) => ({
      ...patient,
      age: calculateAge(patient.birthDate),
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

export async function findById(id: string) {
  const patient = await repository.findById(id);
  if (!patient) throw new NotFoundError('Patient not found');
  return { ...patient, age: calculateAge(patient.birthDate) };
}

export async function create(data: CreatePatientInput, actorId: string) {
  let cpapModelName = data.cpapModelName;
  let filterType = data.filterType;
  if (data.cpapModelId) {
    const model = await repository.findCpapModel(data.cpapModelId);
    if (!model || !model.isActive)
      throw new NotFoundError('Active CPAP model not found');
    cpapModelName ??= `${model.manufacturer} ${model.model}`;
    filterType ??= model.filterType;
  }
  const createData = compactUndefined({
    ...data,
    cpapModelName,
    filterType,
    status: data.status ?? 'ACTIVE',
    whatsappOptIn: data.whatsappOptIn ?? false,
    createdById: actorId,
  });
  const patient = await repository.create(
    createData as Prisma.PatientUncheckedCreateInput,
  );
  await recordAudit({
    actorId,
    patientId: patient.id,
    entityType: 'Patient',
    entityId: patient.id,
    action: 'CREATED',
    fields: Object.keys(data),
  });
  return { ...patient, age: calculateAge(patient.birthDate) };
}

export async function update(
  id: string,
  data: UpdatePatientInput,
  actorId: string,
) {
  const current = await repository.findById(id);
  if (!current) throw new NotFoundError('Patient not found');
  const updateData = compactUndefined({
    ...data,
  }) as Prisma.PatientUncheckedUpdateInput;
  if (data.cpapModelId) {
    const model = await repository.findCpapModel(data.cpapModelId);
    if (!model || !model.isActive)
      throw new NotFoundError('Active CPAP model not found');
    if (data.cpapModelName === undefined)
      updateData.cpapModelName = `${model.manufacturer} ${model.model}`;
    if (data.filterType === undefined) updateData.filterType = model.filterType;
  } else if (data.cpapModelId === null && data.cpapModelName === undefined) {
    updateData.cpapModelName = null;
  }
  if (data.status === 'INACTIVE') {
    updateData.whatsappOptIn = false;
    updateData.whatsappOptOutAt = current.whatsappOptIn
      ? new Date()
      : current.whatsappOptOutAt;
  }
  if (data.whatsappOptIn === false) updateData.whatsappOptOutAt = new Date();
  if (data.whatsappOptIn === true) updateData.whatsappOptOutAt = null;
  const patient = await repository.update(id, updateData);
  await recordAudit({
    actorId,
    patientId: id,
    entityType: 'Patient',
    entityId: id,
    action: 'UPDATED',
    fields: Object.keys(data),
  });
  return { ...patient, age: calculateAge(patient.birthDate) };
}

export async function deactivate(id: string, actorId: string) {
  const current = await repository.findById(id);
  if (!current) throw new NotFoundError('Patient not found');
  if (current.status === 'INACTIVE') return;
  await repository.update(id, {
    status: 'INACTIVE',
    whatsappOptIn: false,
    whatsappOptOutAt: current.whatsappOptIn
      ? new Date()
      : current.whatsappOptOutAt,
  });
  await recordAudit({
    actorId,
    patientId: id,
    entityType: 'Patient',
    entityId: id,
    action: 'DEACTIVATED',
    fields: ['status', 'whatsappOptIn'],
  });
}
