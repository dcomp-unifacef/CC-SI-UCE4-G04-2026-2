import { prisma } from '../db/prisma';

export async function recordAudit(input: {
  actorId?: string | null;
  patientId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  fields?: string[];
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      patientId: input.patientId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      fields: input.fields ?? [],
    },
  });
}
