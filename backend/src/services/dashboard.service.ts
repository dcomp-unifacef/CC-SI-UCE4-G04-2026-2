import { prisma } from '../db/prisma';

function localDayBounds(
  timezone: string,
  date = new Date(),
): { start: Date; end: Date } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const localMidnightAsUtc = Date.UTC(year, month - 1, day);
  const offsetParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(localMidnightAsUtc));
  const offsetValues = Object.fromEntries(
    offsetParts.map((part) => [part.type, part.value]),
  );
  const representedUtc = Date.UTC(
    Number(offsetValues.year),
    Number(offsetValues.month) - 1,
    Number(offsetValues.day),
    Number(offsetValues.hour),
    Number(offsetValues.minute),
    Number(offsetValues.second),
  );
  const offsetMs = representedUtc - localMidnightAsUtc;
  const start = new Date(localMidnightAsUtc - offsetMs);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export async function summary() {
  const setting = await prisma.systemSetting.findUnique({
    where: { id: 'global' },
    select: {
      timezone: true,
      messageAutomationEnabled: true,
      reportAutomationEnabled: true,
    },
  });
  const { start, end } = localDayBounds(
    setting?.timezone ?? 'America/Sao_Paulo',
  );
  const [
    patientsActive,
    messagesScheduledToday,
    messagesSentToday,
    messagesFailedToday,
    reportsPending,
    reportsProcessed,
    reportsFailed,
    messages,
    reports,
    audits,
  ] = await Promise.all([
    prisma.patient.count({ where: { status: 'ACTIVE' } }),
    prisma.messageLog.count({
      where: {
        scheduledAt: { gte: start, lt: end },
        status: { in: ['SCHEDULED', 'PENDING'] },
      },
    }),
    prisma.messageLog.count({
      where: {
        sentAt: { gte: start, lt: end },
        status: { in: ['SENT', 'DELIVERED'] },
      },
    }),
    prisma.messageLog.count({
      where: { updatedAt: { gte: start, lt: end }, status: 'FAILED' },
    }),
    prisma.patientReport.count({
      where: {
        status: { in: ['AWAITING_MATCH', 'PROCESSING', 'REVIEW_REQUIRED'] },
      },
    }),
    prisma.patientReport.count({
      where: { status: { in: ['APPROVED', 'SENT'] } },
    }),
    prisma.patientReport.count({ where: { status: 'FAILED' } }),
    prisma.messageLog.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        category: true,
        status: true,
        updatedAt: true,
        patient: { select: { id: true, fullName: true } },
      },
    }),
    prisma.patientReport.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        platform: true,
        status: true,
        updatedAt: true,
        patient: { select: { id: true, fullName: true } },
      },
    }),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        entityType: true,
        action: true,
        createdAt: true,
        patient: { select: { id: true, fullName: true } },
      },
    }),
  ]);

  const activity = [
    ...messages.map((item) => ({
      id: `message:${item.id}`,
      type: 'MESSAGE',
      title: item.category,
      status: item.status,
      patient: item.patient,
      occurredAt: item.updatedAt,
    })),
    ...reports.map((item) => ({
      id: `report:${item.id}`,
      type: 'REPORT',
      title: item.platform,
      status: item.status,
      patient: item.patient,
      occurredAt: item.updatedAt,
    })),
    ...audits.map((item) => ({
      id: `audit:${item.id}`,
      type: item.entityType,
      title: item.action,
      status: 'RECORDED',
      patient: item.patient,
      occurredAt: item.createdAt,
    })),
  ]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, 10);

  return {
    patientsActive,
    messagesScheduledToday,
    messagesSentToday,
    messagesFailedToday,
    reportsPending,
    reportsProcessed,
    reportsFailed,
    automation: {
      messagesEnabled: setting?.messageAutomationEnabled ?? false,
      reportsEnabled: setting?.reportAutomationEnabled ?? false,
    },
    activity,
  };
}
