export type RunStatus = "done" | "failed" | "running";
export type LogLevel = "INFO" | "WARN" | "ERROR";

export type RunDetail = {
  platform: string;
  kind: string;
  patient: string;
  duration: string;
  attempts: string;
  errorTitle?: string;
  errorText?: string;
  nextAction?: string;
  log: { time: string; message: string; level: LogLevel }[];
};

export type Run = {
  id: number;
  name: string;
  summary: string;
  status: RunStatus;
  at: string; // ISO
  detail?: RunDetail; // só a execução com falha tem detalhe no protótipo
};

export type Connector = {
  id: number;
  name: string;
  status: "connected" | "attention";
  lastSync: string; // ISO
  runId?: number; // execução que explica o problema
};

// Datas relativas a hoje, só para a demonstração
function at(daysAgo: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// TODO: tudo isto vem da API
export const reminders = {
  nextRun: "Hoje, 10:30 · 18 mensagens",
};

export const monthlyReports = {
  alerts: 2,
  nextRun: "01 dez · 32 pacientes",
};

export const connectors: Connector[] = [
  { id: 1, name: "AirView · ResMed", status: "connected", lastSync: at(0, 8, 15) },
  { id: 2, name: "Care Orchestrator · Philips", status: "attention", lastSync: at(1, 17, 40), runId: 2048 },
  { id: 3, name: "Smart Live", status: "connected", lastSync: at(0, 8, 2) },
];

export const runs: Run[] = [
  { id: 2049, name: "Lembretes WhatsApp", summary: "18 destinatários", status: "done", at: at(0, 9, 30) },
  {
    id: 2048,
    name: "Relatório Care Orchestrator",
    summary: "Falha ao acessar sessão",
    status: "failed",
    at: at(1, 17, 40),
    detail: {
      platform: "Care Orchestrator",
      kind: "Relatório mensal",
      patient: "Carlos Santos",
      duration: "00:02:14",
      attempts: "2 de 3",
      errorTitle: "Falha na autenticação do portal",
      errorText: "A sessão autorizada expirou. Nenhum relatório foi baixado nem enviado ao paciente.",
      nextAction: "Próxima ação: renovar sessão no portal e reprocessar esta tarefa.",
      log: [
        { time: "17:40:02", message: "Job iniciado", level: "INFO" },
        { time: "17:40:14", message: "Acessando portal Care Orchestrator", level: "INFO" },
        { time: "17:40:39", message: "Sessão inválida; solicitada autenticação", level: "WARN" },
        { time: "17:42:16", message: "Tempo limite aguardando sessão autorizada", level: "ERROR" },
        { time: "17:42:16", message: "Tarefa encerrada sem download ou envio", level: "INFO" },
      ],
    },
  },
  { id: 2047, name: "Importação em lote", summary: "3 arquivos processados", status: "done", at: at(1, 16, 42) },
];
