import { prisma } from '../db/prisma';
import type { UpdateSettingsInput } from '../dto/system/update-settings.dto';
import type { ReportPlatform } from '../generated/prisma/enums';
import type { Prisma } from '../generated/prisma/client';
import { compactUndefined } from '../utils/object.util';
import { recordAudit } from './audit.service';

const PORTALS: ReportPlatform[] = [
  'AIRVIEW',
  'CARE_ORCHESTRATOR',
  'SMART_LIVE',
];

export async function getSettings() {
  return prisma.systemSetting.upsert({
    where: { id: 'global' },
    create: { id: 'global' },
    update: {},
    select: {
      id: true,
      timezone: true,
      sendingWindowStart: true,
      sendingWindowEnd: true,
      messageAutomationEnabled: true,
      reportAutomationEnabled: true,
      updatedAt: true,
    },
  });
}

export async function updateSettings(
  data: UpdateSettingsInput,
  actorId: string,
) {
  const cleanData = compactUndefined(
    data,
  ) as Prisma.SystemSettingUncheckedCreateInput;
  const setting = await prisma.systemSetting.upsert({
    where: { id: 'global' },
    create: { id: 'global', ...cleanData, updatedById: actorId },
    update: {
      ...(cleanData as Prisma.SystemSettingUncheckedUpdateInput),
      updatedById: actorId,
    },
    select: {
      id: true,
      timezone: true,
      sendingWindowStart: true,
      sendingWindowEnd: true,
      messageAutomationEnabled: true,
      reportAutomationEnabled: true,
      updatedAt: true,
    },
  });
  await recordAudit({
    actorId,
    entityType: 'SystemSetting',
    entityId: 'global',
    action: 'UPDATED',
    fields: Object.keys(data),
  });
  return setting;
}

export async function listPortals() {
  await prisma.$transaction(
    PORTALS.map((platform) =>
      prisma.portalSetting.upsert({
        where: { platform },
        create: { platform },
        update: {},
      }),
    ),
  );
  return prisma.portalSetting.findMany({ orderBy: { platform: 'asc' } });
}

export async function updatePortal(
  platform: ReportPlatform,
  isEnabled: boolean,
  actorId: string,
) {
  const portal = await prisma.portalSetting.upsert({
    where: { platform },
    create: { platform, isEnabled },
    update: { isEnabled },
  });
  await recordAudit({
    actorId,
    entityType: 'PortalSetting',
    entityId: portal.id,
    action: 'UPDATED',
    fields: ['isEnabled'],
  });
  return portal;
}
