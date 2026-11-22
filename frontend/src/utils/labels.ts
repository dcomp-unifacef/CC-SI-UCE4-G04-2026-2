export type StatusColor = "success" | "warning" | "danger";

export const badgeClasses: Record<StatusColor, string> = {
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-danger-bg text-danger-fg",
};

export const patientStatusLabels: Record<string, [string, StatusColor]> = {
  ACTIVE: ["Ativo", "success"],
  PAUSED: ["Pausado", "warning"],
  INACTIVE: ["Inativo", "danger"],
};

export const filterTypeLabels: Record<string, string> = {
  WASHABLE: "Lavável",
  DISPOSABLE: "Descartável",
  UNKNOWN: "Não informado",
};

export const messageCategoryLabels: Record<string, string> = {
  FILTER_WASH: "Higienização do filtro",
  FILTER_REPLACE_DISPOSABLE: "Troca de filtro descartável",
  FILTER_REPLACE_WASHABLE: "Troca de filtro lavável",
  ANNUAL_MAINTENANCE: "Manutenção anual",
  MONTHLY_REPORT: "Relatório mensal",
  CUSTOM: "Mensagem personalizada",
};

export const messageStatusLabels: Record<string, [string, StatusColor]> = {
  SCHEDULED: ["Agendada", "warning"],
  PENDING: ["Pendente", "warning"],
  PROCESSING: ["Processando", "warning"],
  SENT: ["Enviada", "success"],
  DELIVERED: ["Entregue", "success"],
  FAILED: ["Falhou", "danger"],
  CANCELLED: ["Cancelada", "danger"],
};

export const reportStatusLabels: Record<string, [string, StatusColor]> = {
  AWAITING_MATCH: ["Aguardando paciente", "warning"],
  PROCESSING: ["Processando", "warning"],
  REVIEW_REQUIRED: ["Revisar", "warning"],
  APPROVED: ["Aprovado", "success"],
  SENT: ["Enviado", "success"],
  FAILED: ["Falhou", "danger"],
};

export const reportPlatformLabels: Record<string, string> = {
  AIRVIEW: "AirView",
  CARE_ORCHESTRATOR: "Care Orchestrator",
  SMART_LIVE: "Smart Live",
  MANUAL: "Manual",
};

export const jobTypeLabels: Record<string, string> = {
  MESSAGE_SEND: "Lembretes WhatsApp",
  REPORT_IMPORT: "Importação de relatório",
  REPORT_PROCESS: "Processamento de relatório",
  REPORT_SEND: "Envio de relatório",
  PORTAL_SYNC: "Sincronização de portal",
};

export const jobStatusLabels: Record<string, [string, StatusColor]> = {
  QUEUED: ["Na fila", "warning"],
  RUNNING: ["Em execução", "warning"],
  SUCCEEDED: ["Concluída", "success"],
  FAILED: ["Falhou", "danger"],
  CANCELLED: ["Cancelada", "danger"],
};

export const portalLabels: Record<string, string> = {
  AIRVIEW: "AirView · ResMed",
  CARE_ORCHESTRATOR: "Care Orchestrator · Philips",
  SMART_LIVE: "Smart Live",
};

export const auditEntityLabels: Record<string, [string, string]> = {
  Patient: ["Paciente", "/pacientes"],
  PatientDocument: ["Documento do paciente", "/pacientes"],
  PatientReport: ["Relatório", "/relatorios"],
  MessageLog: ["Mensagem", "/mensagens"],
  MessageTemplate: ["Modelo de mensagem", "/configuracoes"],
  CpapModel: ["Modelo de CPAP", "/configuracoes"],
  AutomationJob: ["Automação", "/automacoes"],
  SystemSetting: ["Configurações", "/configuracoes"],
  PortalSetting: ["Portal de relatórios", "/configuracoes"],
  User: ["Usuário", "/configuracoes"],
  EvolutionApi: ["WhatsApp", "/mensagens"],
  EvolutionApiTest: ["WhatsApp", "/mensagens"],
};

export const auditActionLabels: Record<string, string> = {
  CREATED: "Cadastro",
  UPDATED: "Atualização",
  DEACTIVATED: "Desativação",
  UPLOADED: "Arquivo enviado",
  AUTO_MATCHED: "Associação automática",
  MANUALLY_ASSOCIATED: "Associação manual",
  METRICS_UPDATED: "Métricas atualizadas",
  APPROVED: "Aprovação",
  SCHEDULED: "Agendamento",
  RETRY_QUEUED: "Nova tentativa na fila",
  REPROCESS_QUEUED: "Reprocessamento na fila",
  PASSWORD_CHANGED: "Senha alterada",
  PAIRING_QR_REQUESTED: "QR de pareamento solicitado",
  TEST_MESSAGE_SENT: "Mensagem de teste enviada",
};

const timeFormat = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const dayMonthFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function formatDate(iso: string | null) {
  return iso ? dateFormat.format(new Date(iso)) : "-";
}

const monthShortFormat = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  timeZone: "UTC",
});

const monthLongFormat = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  timeZone: "UTC",
});

export function formatMonthShort(iso: string) {
  const text = monthShortFormat.format(new Date(iso)).replace(".", "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonthLong(iso: string) {
  return monthLongFormat.format(new Date(iso));
}

export function formatPeriod(start: string | null, end: string | null) {
  if (!start || !end) return "não informado";
  return `${formatDate(start)} a ${formatDate(end)}`;
}

export function daysInPeriod(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(diff / 86400000) + 1;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function formatPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return `Hoje, ${timeFormat.format(date)}`;
  if (isSameDay(date, yesterday)) return `Ontem, ${timeFormat.format(date)}`;
  return `${dayMonthFormat.format(date)}, ${timeFormat.format(date)}`;
}

export function formatTime(iso: string) {
  const date = new Date(iso);
  if (isSameDay(date, new Date())) return timeFormat.format(date);
  return `${dayMonthFormat.format(date)} ${timeFormat.format(date)}`;
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
