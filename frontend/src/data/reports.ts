export type ImportStatus = "linked" | "review" | "processing" | "failed";

export type ImportFile = {
  id: number;
  fileName: string;
  identification: string;
  patient?: string;
  status: ImportStatus;
  reportId?: number; // só existe quando o relatório já foi lido
};

export type Report = {
  id: number;
  patient: string;
  phone: string;
  platform: string;
  fileName: string;
  size: string;
  periodLabel: string; // "Setembro 2026"
  month: string; // "setembro"
  range: string; // "01–30 set 2026"
  status: string;
  daysUsed: number;
  daysTotal: number;
  avgDaily: string;
  adherence: number;
  ahi: string;
  leak: string;
  history: { month: string; value: number }[]; // % de adesão
};

// TODO: contagens reais vindas da API (a fila abaixo é só uma amostra)
export const importStats = [
  { label: "Pendentes", value: 12 },
  { label: "Em revisão", value: 4 },
  { label: "Processados", value: 184 },
  { label: "Com falha", value: 2 },
];

export const importQueue: ImportFile[] = [
  {
    id: 1, fileName: "relatorio_airview_set.pdf", identification: "ID paciente AV-48291 · Set/2026",
    patient: "Maria Oliveira", status: "linked", reportId: 1,
  },
  {
    id: 2, fileName: "care-orchestrator-09.pdf", identification: "Nome detectado: Carlos S. · 09/2026",
    status: "review",
  },
  {
    id: 3, fileName: "smartlive_1004.pdf", identification: "ID paciente SL-11037 · Out/2026",
    status: "processing",
  },
];

export const reports: Report[] = [
  {
    id: 1, patient: "Maria Oliveira", phone: "(11) 98765-4321", platform: "AirView",
    fileName: "relatorio_setembro_2026.pdf", size: "1,8 MB",
    periodLabel: "Setembro 2026", month: "setembro", range: "01–30 set 2026", status: "Em revisão",
    daysUsed: 28, daysTotal: 30, avgDaily: "6h42", adherence: 93, ahi: "2,4 eventos/h", leak: "8 L/min",
    history: [
      { month: "Mai", value: 78 }, { month: "Jun", value: 85 }, { month: "Jul", value: 90 },
      { month: "Ago", value: 88 }, { month: "Set", value: 93 }, { month: "Out", value: 91 },
    ],
  },
];  