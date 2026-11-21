import { Prisma } from '../generated/prisma/client';
import type { CreateTemplateInput } from '../dto/template/create-template.dto';
import type { TemplateQueryInput } from '../dto/template/template-query.dto';
import type { UpdateTemplateInput } from '../dto/template/update-template.dto';
import { NotFoundError } from '../errors/NotFoundError';
import * as repository from '../repositories/template.repository';
import { recordAudit } from './audit.service';

export async function list(query: TemplateQueryInput) {
  const where: Prisma.MessageTemplateWhereInput = {};
  if (query.category) where.category = query.category;
  if (query.filterType) where.filterType = query.filterType;
  if (query.isActive !== undefined) where.isActive = query.isActive;
  if (query.search)
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { code: { contains: query.search, mode: 'insensitive' } },
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
  const template = await repository.findById(id);
  if (!template) throw new NotFoundError('Message template not found');
  return template;
}

export async function create(data: CreateTemplateInput, actorId: string) {
  const template = await repository.create(
    data as Prisma.MessageTemplateCreateInput,
  );
  await recordAudit({
    actorId,
    entityType: 'MessageTemplate',
    entityId: template.id,
    action: 'CREATED',
    fields: ['name', 'category', 'body'],
  });
  return template;
}

export async function update(
  id: string,
  data: UpdateTemplateInput,
  actorId: string,
) {
  await findById(id);
  const template = await repository.update(
    id,
    data as Prisma.MessageTemplateUpdateInput,
  );
  await recordAudit({
    actorId,
    entityType: 'MessageTemplate',
    entityId: id,
    action: 'UPDATED',
    fields: Object.keys(data),
  });
  return template;
}

export async function deactivate(id: string, actorId: string) {
  await findById(id);
  const template = await repository.update(id, { isActive: false });
  await recordAudit({
    actorId,
    entityType: 'MessageTemplate',
    entityId: id,
    action: 'DEACTIVATED',
    fields: ['isActive'],
  });
  return template;
}
