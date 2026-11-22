// TODO: tudo isto vem da API
export const adminProfile = {
  nome: "Hitalo Oliveira",
  email: "hitalo@sonointeligente.com.br",
  celular: "(11) 3333-0000",
  fuso: "(UTC−03:00) Brasília",
};

export const profileTimezones = [
  "(UTC−02:00) Fernando de Noronha",
  "(UTC−03:00) Brasília",
  "(UTC−04:00) Manaus",
  "(UTC−05:00) Rio Branco",
];

export const ianaTimezones = ["America/Sao_Paulo", "America/Noronha", "America/Manaus", "America/Rio_Branco"];

// id = número do dia em Date.getDay()
export const weekdays = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
  { id: 0, label: "Dom" },
];

export type FilterType = "Lavável" | "Descartável";
export const filterTypes: FilterType[] = ["Lavável", "Descartável"];

export const reminderRulesByFilter: Record<FilterType, string> = {
  Lavável: "Higienização + troca 4 meses",
  Descartável: "Troca 60 dias",
};

export const reminderSummary = [
  { title: "Higienização filtro lavável", detail: "A cada 15 dias" },
  { title: "Troca filtro lavável", detail: "4 meses" },
  { title: "Troca filtro descartável", detail: "60 dias" },
  { title: "Lembretes anuais", detail: "Máscara, traqueia e limpeza preventiva" },
];

export type CpapModel = { id: number; maker: string; model: string; filter: FilterType };

export const cpapModels: CpapModel[] = [
  { id: 1, maker: "ResMed", model: "AirSense 10", filter: "Lavável" },
  { id: 2, maker: "ResMed", model: "AirSense 11", filter: "Descartável" },
  { id: 3, maker: "Philips", model: "DreamStation 2", filter: "Lavável" },
  { id: 4, maker: "Luna", model: "G3", filter: "Descartável" },
];
