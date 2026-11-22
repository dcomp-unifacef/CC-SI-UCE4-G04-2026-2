export type MessageStatus = "scheduled" | "waiting" | "sent" | "failed";

export type Message = {
  id: number;
  patient: string;
  phone: string;
  followUpActive: boolean;
  title: string;
  type: string;
  body: string;
  template: string;
  rule: string;
  status: MessageStatus;
  scheduledAt: string; // ISO
  createdAt: string; // ISO
  error?: string;
  attempts: { time: string; label: string; failed?: boolean }[];
};

// Datas relativas a hoje, só para a demonstração
function at(daysAgo: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const messages: Message[] = [
  {
    id: 10845, patient: "Marcos Lima", phone: "(11) 98765-1122", followUpActive: true,
    title: "Higienização do filtro", type: "Manutenção",
    body: "Olá, Marcos! Está na hora de higienizar o filtro lavável do seu CPAP.\n\nQualquer dúvida, fale com a Sono Inteligente.",
    template: "Higienização do filtro lavável · v2", rule: "Filtro lavável · 15 dias",
    status: "scheduled", scheduledAt: at(0, 10, 30), createdAt: at(1, 9),
    attempts: [{ time: "09:00", label: "Envio agendado" }],
  },
  {
    id: 10844, patient: "Maria Oliveira", phone: "(11) 98765-4321", followUpActive: true,
    title: "Troca de filtro descartável", type: "Manutenção",
    body: "Olá, Maria! Está na hora de trocar o filtro descartável do seu CPAP.\n\nSe precisar de um filtro novo, fale com a Sono Inteligente.",
    template: "Troca de filtro descartável · v3", rule: "Filtro descartável · 60 dias",
    status: "sent", scheduledAt: at(0, 9, 42), createdAt: at(1, 9),
    attempts: [{ time: "09:42", label: "Envio solicitado" }, { time: "09:42", label: "Entregue" }],
  },
  {
    id: 10842, patient: "Ana Costa", phone: "(11) 98765-7721", followUpActive: true,
    title: "Troca de filtro descartável", type: "Manutenção",
    body: "Olá, Ana! Está na hora de trocar o filtro descartável do seu CPAP.\n\nA troca regular ajuda a manter o aparelho em boas condições.\n\nSe precisar de um filtro novo, fale com a Sono Inteligente.",
    template: "Troca de filtro descartável · v3", rule: "Filtro descartável · 60 dias",
    status: "failed", scheduledAt: at(1, 14, 2), createdAt: at(1, 9),
    error: "A Evolution API não confirmou a entrega. Último retorno: conexão indisponível.",
    attempts: [
      { time: "14:02", label: "Envio solicitado" },
      { time: "14:02", label: "Falha de conexão", failed: true },
      { time: "14:17", label: "Retry automático agendado" },
    ],
  },
  {
    id: 10790, patient: "Paula Mendes", phone: "(11) 98765-3300", followUpActive: false,
    title: "Relatório mensal · Setembro", type: "Relatório",
    body: "Olá, Paula! Seu relatório de setembro está pronto.",
    template: "Relatório mensal · v1", rule: "Mensal",
    status: "waiting", scheduledAt: at(26, 11), createdAt: at(27, 9),
    attempts: [{ time: "11:00", label: "Aguardando processamento" }],
  },
  {
    id: 10761, patient: "Carlos Santos", phone: "(11) 98765-8800", followUpActive: true,
    title: "Higienização do filtro", type: "Manutenção",
    body: "Olá, Carlos! Está na hora de higienizar o filtro lavável do seu CPAP.",
    template: "Higienização do filtro lavável · v2", rule: "Filtro lavável · 15 dias",
    status: "sent", scheduledAt: at(28, 9), createdAt: at(29, 9),
    attempts: [{ time: "09:00", label: "Envio solicitado" }, { time: "09:00", label: "Entregue" }],
  },
];

export type MessageTemplate = {
  id: number;
  name: string;
  category: string;
  rule: string;
  body: string;
  videoUrl: string;
};

export const templates: MessageTemplate[] = [
  {
    id: 1,
    name: "Higienização do filtro lavável",
    category: "Lembrete de manutenção",
    rule: "Filtro lavável · 15 dias",
    body: "Olá, {{nome}}! Está na hora de higienizar o filtro lavável do seu CPAP.\n\nVeja o passo a passo: {{link_video}}\n\nQualquer dúvida, fale com a Sono Inteligente.",
    videoUrl: "",
  },
];

export const templateCategories = ["Lembrete de manutenção", "Relatório", "Boas-vindas"];
export const templateRules = [
  "Filtro lavável · 15 dias",
  "Filtro descartável · 60 dias",
  "Troca de máscara · 365 dias",
  "Mensal",
];
export const templateVariables = ["{{nome}}", "{{link_video}}"];