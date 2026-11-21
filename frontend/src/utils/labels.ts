export type StatusColor = "success" | "warning" | "danger";

export const messageCategoryLabels: Record<string, string> = {
  FILTER_WASH: "Higienização do filtro",
  FILTER_REPLACE_DISPOSABLE: "Troca de filtro",
  FILTER_REPLACE_WASHABLE: "Troca de filtro",
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
