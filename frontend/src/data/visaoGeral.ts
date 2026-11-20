export const indicadores = [
  { titulo: "Pacientes ativos", valor: "248", nota: "12 novos este mês" },
  { titulo: "Mensagens hoje", valor: "18", nota: "14 enviadas · 4 agendadas" },
  { titulo: "Relatórios pendentes", valor: "07", nota: "3 aguardando revisão" },
  { titulo: "Falhas para revisar", valor: "02", nota: "Atenção necessária" },
];

export const atividades = [
  { titulo: "Mensagem enviada", detalhe: "Lembrete de higienização · Maria Oliveira", data: "Hoje, 09:42", status: "Enviada", cor: "sucesso", rota: "/mensagens" },
  { titulo: "Relatório importado", detalhe: "Carlos Santos · AirView · Setembro", data: "Hoje, 09:18", status: "Revisar", cor: "atencao", rota: "/relatorios" },
  { titulo: "Paciente atualizado", detalhe: "Máscara atualizada · João Ferreira", data: "Ontem, 16:35", status: "Concluído", cor: "sucesso", rota: "/pacientes" },
  { titulo: "Mensagem com falha", detalhe: "Troca de filtro · Ana Costa", data: "Ontem, 14:02", status: "Tentar novamente", cor: "falha", rota: "/mensagens" },
];

export const lembretes = [
  { nome: "Marcos Lima", detalhe: "Higienizar filtro", hora: "10:30" },
  { nome: "Paula Mendes", detalhe: "Troca de filtro", hora: "11:00" },
  { nome: "Rafael Souza", detalhe: "Manutenção anual", hora: "14:15" },
];