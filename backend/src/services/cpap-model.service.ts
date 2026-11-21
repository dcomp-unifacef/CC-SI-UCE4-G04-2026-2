import { Prisma } from '../generated/prisma/client';
import type { CreateCpapModelInput } from '../dto/cpap/create-cpap-model.dto';
import type { CpapModelQueryInput } from '../dto/cpap/cpap-model-query.dto';
import type { UpdateCpapModelInput } from '../dto/cpap/update-cpap-model.dto';
import { NotFoundError } from '../errors/NotFoundError';
import * as repository from '../repositories/cpap-model.repository';
import { recordAudit } from './audit.service';

export async function list(query: CpapModelQueryInput) {
  const where: Prisma.CpapModelWhereInput = {};
  if (query.filterType) where.filterType = query.filterType;
  if (query.isActive !== undefined) where.isActive = query.isActive;
  if (query.search)
    where.OR = [
      { manufacturer: { contains: query.search, mode: 'insensitive' } },
      { model: { contains: query.search, mode: 'insensitive' } },
    ];
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
  const model = await repository.findById(id);
  if (!model) throw new NotFoundError('CPAP model not found');
  return model;
}

export async function create(data: CreateCpapModelInput, actorId: string) {
  const model = await repository.create(data as Prisma.CpapModelCreateInput);
  await recordAudit({
    actorId,
    entityType: 'CpapModel',
    entityId: model.id,
    action: 'CREATED',
    fields: ['manufacturer', 'model', 'filterType'],
  });
  return model;
}

export async function update(
  id: string,
  data: UpdateCpapModelInput,
  actorId: string,
) {
  await findById(id);
  const model = await repository.update(
    id,
    data as Prisma.CpapModelUpdateInput,
  );
  await recordAudit({
    actorId,
    entityType: 'CpapModel',
    entityId: id,
    action: 'UPDATED',
    fields: Object.keys(data),
  });
  return model;
}

export async function deactivate(id: string, actorId: string) {
  await findById(id);
  const model = await repository.update(id, { isActive: false });
  await recordAudit({
    actorId,
    entityType: 'CpapModel',
    entityId: id,
    action: 'DEACTIVATED',
    fields: ['isActive'],
  });
  return model;
}
