export type Conectividade = "airview" | "sd" | "bmc";
export type StatusClinico = "aderente" | "alerta-fuga" | "adaptacao";

type Tom = "verde" | "vermelho" | "amarelo" | "ciano" | "cinza" | "roxo";

export type Paciente = {
  registro: string;
  nome: string;
  cpf: string; // já mascarado pela API (LGPD)
  avatarTom: Tom;
  dispositivo: string;
  serial: string;
  conectividade: Conectividade;
  mediaUso: string;
  progresso: number; // 0 a 100 (barra de uso)
  indicador: string; // texto à direita da média ("119% meta", "Fuga: 32L/m"...)
  indicadorTom: Tom;
  status: StatusClinico;
};

// Dados de exemplo (vindos do protótipo). Troque pela resposta da API.
export const pacientes: Paciente[] = [
  {
    registro: "#SI-8902",
    nome: "Thomas Rodrigues Marques",
    cpf: "341.***.***-20",
    avatarTom: "ciano",
    dispositivo: "ResMed AirSense 10",
    serial: "2221-987412",
    conectividade: "airview",
    mediaUso: "9h 33m / dia",
    progresso: 100,
    indicador: "119% meta",
    indicadorTom: "verde",
    status: "aderente",
  },
  {
    registro: "#SI-8903",
    nome: "Diego Campos de Oliveira",
    cpf: "819.***.***-04",
    avatarTom: "cinza",
    dispositivo: "Philips DreamStation 2",
    serial: "PH-481023",
    conectividade: "sd",
    mediaUso: "5h 48m / dia",
    progresso: 72,
    indicador: "72% meta",
    indicadorTom: "verde",
    status: "aderente",
  },
  {
    registro: "#SI-8904",
    nome: "Caio Henrique Martins Souza",
    cpf: "112.***.***-71",
    avatarTom: "ciano",
    dispositivo: "ResMed AirSense 11",
    serial: "2311-665201",
    conectividade: "airview",
    mediaUso: "8h 21m / dia",
    progresso: 100,
    indicador: "104% meta",
    indicadorTom: "verde",
    status: "aderente",
  },
  {
    registro: "#SI-8905",
    nome: "Carlos Eduardo Gomes",
    cpf: "629.***.***-89",
    avatarTom: "vermelho",
    dispositivo: "BMC Gii Auto CPAP",
    serial: "BMC-773001",
    conectividade: "bmc",
    mediaUso: "3h 12m / dia",
    progresso: 40,
    indicador: "Fuga: 32L/m",
    indicadorTom: "vermelho",
    status: "alerta-fuga",
  },
  {
    registro: "#SI-8906",
    nome: "Natália Campos de Paula",
    cpf: "490.***.***-33",
    avatarTom: "roxo",
    dispositivo: "ResMed AirSense 10 Elite",
    serial: "2219-550921",
    conectividade: "airview",
    mediaUso: "6h 13m / dia",
    progresso: 78,
    indicador: "Dia 4 de 30",
    indicadorTom: "amarelo",
    status: "adaptacao",
  },
];

export const TOTAL_PACIENTES = 1240;
export const POR_PAGINA = 10;