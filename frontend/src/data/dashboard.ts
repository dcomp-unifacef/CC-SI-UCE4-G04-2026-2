export type StatusAdesao = "fuga" | "otima" | "estavel" | "ajuste";

type Tom = "verde" | "vermelho" | "amarelo" | "ciano" | "cinza" | "roxo";

export const statusAdesao: Record<StatusAdesao, { texto: string; tom: Tom }> = {
  fuga: { texto: "Fuga Alta", tom: "vermelho" },
  otima: { texto: "Adesão Ótima", tom: "verde" },
  estavel: { texto: "Estável", tom: "ciano" },
  ajuste: { texto: "Ajuste Pressão", tom: "amarelo" },
};

export type LinhaAdesao = {
  id: number;
  paciente: string;
  dispositivo: string;
  usoDiario: string;
  usoNota: string;
  usoNotaTom: Tom;
  iah: string;
  iahTom: Tom;
  fuga: string;
  fugaTom?: Tom;
  status: StatusAdesao;
};

// Dados de exemplo (vindos do protótipo). Troque pela resposta da API.
export const adesaoRecente: LinhaAdesao[] = [
  {
    id: 1,
    paciente: "Marcos Silveira",
    dispositivo: "ResMed AirSense 10 • AutoSet",
    usoDiario: "2h 45m",
    usoNota: "< 4h mínimo",
    usoNotaTom: "vermelho",
    iah: "8.4 /h",
    iahTom: "amarelo",
    fuga: "38.2 L/min",
    fugaTom: "vermelho",
    status: "fuga",
  },
  {
    id: 2,
    paciente: "Clara Luiza",
    dispositivo: "ResMed AirMini Travel",
    usoDiario: "7h 20m",
    usoNota: "98% dos dias",
    usoNotaTom: "verde",
    iah: "1.2 /h",
    iahTom: "verde",
    fuga: "4.1 L/min",
    status: "otima",
  },
  {
    id: 3,
    paciente: "José Augusto",
    dispositivo: "Philips DreamStation 2",
    usoDiario: "6h 10m",
    usoNota: "84% dos dias",
    usoNotaTom: "verde",
    iah: "3.1 /h",
    iahTom: "verde",
    fuga: "12.0 L/min",
    status: "estavel",
  },
  {
    id: 4,
    paciente: "Beatriz Neves",
    dispositivo: "ResMed AirSense 11",
    usoDiario: "4h 05m",
    usoNota: "Limite mínimo",
    usoNotaTom: "amarelo",
    iah: "5.8 /h",
    iahTom: "amarelo",
    fuga: "18.5 L/min",
    status: "ajuste",
  },
  {
    id: 5,
    paciente: "Eduardo Mendes",
    dispositivo: "BMC Luna G3 BiPAP 25A",
    usoDiario: "8h 02m",
    usoNota: "100% adesão",
    usoNotaTom: "verde",
    iah: "0.9 /h",
    iahTom: "verde",
    fuga: "2.8 L/min",
    status: "otima",
  },
];

export type Atendimento = {
  id: number;
  hora: string;
  titulo: string;
  detalhe: string;
};

export const agendaHoje: Atendimento[] = [
  {
    id: 1,
    hora: "09:30",
    titulo: "Consulta de Adaptação Facial",
    detalhe: "Dr. Hitalo Garcia • Unidade Central (Presencial)",
  },
  {
    id: 2,
    hora: "11:00",
    titulo: "Teleconsulta: Análise de IAH Residual",
    detalhe: "Fernanda Prado • Vídeo Chamada Segura",
  },
  {
    id: 3,
    hora: "14:30",
    titulo: "Instalação & Calibração Domiciliar",
    detalhe: "Técnico Tiago • Paciente Carlos Drummond",
  },
];

export const TOTAL_ATENDIMENTOS_HOJE = 6;