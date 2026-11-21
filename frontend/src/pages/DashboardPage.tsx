import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchUpcomingReminders,
  fetchSummary,
  type ActivityResponse,
  type ReminderResponse,
  type SummaryResponse,
} from "../services/dashboard";
import {
  auditActionLabels,
  messageCategoryLabels,
  auditEntityLabels,
  formatRelativeDate,
  formatTime,
  reportPlatformLabels,
  getGreeting,
  messageStatusLabels,
  reportStatusLabels,
  type StatusColor,
} from "../utils/labels";

const statusColors: Record<StatusColor, string> = {
  success: "text-success-fg",
  warning: "text-warning-fg",
  danger: "text-danger-fg",
};

type Activity = {
  id: string;
  title: string;
  detail: string;
  date: string;
  status: string;
  color: StatusColor;
  route: string;
};

type State =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      summary: SummaryResponse;
      reminders: ReminderResponse[];
    };

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function buildActivity(item: ActivityResponse): Activity {
  const patient = item.patient?.fullName;
  const date = formatRelativeDate(item.occurredAt);

  if (item.type === "MESSAGE") {
    const [status, color] = messageStatusLabels[item.status] ?? [item.status, "warning"];
    const category = messageCategoryLabels[item.title] ?? item.title;
    return {
      id: item.id,
      title: "Mensagem",
      detail: [category, patient].filter(Boolean).join(" · "),
      date,
      status,
      color,
      route: "/mensagens",
    };
  }

  if (item.type === "REPORT") {
    const [status, color] = reportStatusLabels[item.status] ?? [item.status, "warning"];
    const platform = reportPlatformLabels[item.title] ?? item.title;
    return {
      id: item.id,
      title: "Relatório",
      detail: [platform, patient].filter(Boolean).join(" · "),
      date,
      status,
      color,
      route: "/relatorios",
    };
  }

  const [entity, route] = auditEntityLabels[item.type] ?? [item.type, "/inicio"];
  const action = auditActionLabels[item.title] ?? item.title;
  return {
    id: item.id,
    title: entity,
    detail: [action, patient].filter(Boolean).join(" · "),
    date,
    status: "Registrado",
    color: "success",
    route,
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(() => {
    Promise.all([fetchSummary(), fetchUpcomingReminders()])
      .then(([summary, reminders]) =>
        setState({ status: "ready", summary, reminders }),
      )
      .catch(() => setState({ status: "error" }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const firstName = user?.name.split(" ")[0] ?? "";
  const summary = state.status === "ready" ? state.summary : null;
  const reminders = state.status === "ready" ? state.reminders : [];
  const activities = summary ? summary.activity.map(buildActivity) : [];

  const messagesToday =
    (summary?.messagesScheduledToday ?? 0) +
    (summary?.messagesSentToday ?? 0) +
    (summary?.messagesFailedToday ?? 0);
  const failures = (summary?.messagesFailedToday ?? 0) + (summary?.reportsFailed ?? 0);
  const automationActive =
    summary?.automation.messagesEnabled || summary?.automation.reportsEnabled;

  const indicators = [
    {
      title: "Pacientes ativos",
      value: summary ? String(summary.patientsActive) : "-",
      note: "Cadastros com status ativo",
    },
    {
      title: "Mensagens hoje",
      value: summary ? pad(messagesToday) : "-",
      note: summary
        ? `Enviadas: ${summary.messagesSentToday} · Agendadas: ${summary.messagesScheduledToday}`
        : "",
    },
    {
      title: "Relatórios pendentes",
      value: summary ? pad(summary.reportsPending) : "-",
      note: summary ? `Processados: ${summary.reportsProcessed}` : "",
    },
    {
      title: "Falhas para revisar",
      value: summary ? pad(failures) : "-",
      note: summary ? (failures > 0 ? "Atenção necessária" : "Nenhuma falha") : "",
    },
  ];

  return (
    <>
      <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
        {getGreeting()}, {firstName} 👋
      </h2>

      <p className="mb-7 text-sm leading-5 text-muted">
        Aqui está o resumo do acompanhamento de hoje.
      </p>

      {state.status === "error" && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between gap-3 rounded-[13px] bg-danger-bg px-5 py-4 text-sm text-danger-fg"
        >
          <span>Não foi possível load os dados do painel.</span>
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              setState({ status: "loading" });
              load();
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <section
        aria-label="Resumo do acompanhamento"
        className="mb-6 grid grid-cols-4 gap-4 max-[800px]:grid-cols-2 max-[800px]:gap-3"
      >
        {indicators.map((item) => (
          <article
            className="rounded-[13px] bg-surface p-5 min-h-33"
            key={item.title}
          >
            <h3 className="mb-2.5 text-[13px] font-semibold text-muted">
              {item.title}
            </h3>
            <strong className="block text-[30px] leading-10 text-foreground">
              {item.value}
            </strong>
            <p className="mt-1 text-xs text-muted">{item.note}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-[700fr_406fr] gap-5 max-[1190px]:grid-cols-1">
        <section className="rounded-[13px] bg-surface p-5 px-6 py-5 min-h-90 text-card-foreground max-[800px]:p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold max-[800px]:text-lg">
              Atividade recente
            </h3>
            <Link className="text-xs text-link" to="/mensagens">
              Ver histórico →
            </Link>
          </div>

          {state.status === "loading" && (
            <p className="mt-6 text-sm text-muted">Carregando...</p>
          )}
          {state.status === "ready" && activities.length === 0 && (
            <p className="mt-6 text-sm text-muted">
              Nenhuma atividade registrada ainda.
            </p>
          )}

          <ul>
            {activities.map((item) => (
              <li
                key={item.id}
                className="grid min-h-17 grid-cols-[minmax(0,1fr)_100px_94px] gap-2 border-b border-border py-4 max-[800px]:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="max-[800px]:row-span-2">
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="mt-1 text-xs text-muted">{item.detail}</p>
                </div>
                <time className="pt-0.5 text-[11px] text-muted max-[800px]:text-right">
                  {item.date}
                </time>
                <Link
                  to={item.route}
                  className={`self-end text-[11px] whitespace-nowrap max-[800px]:text-right ${statusColors[item.color]}`}
                >
                  {item.status}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[13px] bg-surface p-5 px-6 py-5 min-h-90 text-card-foreground max-[800px]:p-5">
          <h3 className="text-xl font-semibold max-[800px]:text-lg">
            Próximos lembretes
          </h3>
          <p className="mt-5 mb-4 text-xs text-muted">Agendados</p>

          {state.status === "loading" && (
            <p className="text-sm text-muted">Carregando...</p>
          )}
          {state.status === "ready" && reminders.length === 0 && (
            <p className="text-sm text-muted">Nenhum lembrete agendado.</p>
          )}

          <ul>
            {reminders.map((item) => (
              <li key={item.id} className="mb-8 flex items-center gap-3.5">
                <span className="grid size-9 place-items-center rounded-[9px] bg-highlight text-link">
                  <Clock size={17} />
                </span>
                <div>
                  <h4 className="text-[13px] font-semibold">
                    {item.patient.fullName}
                  </h4>
                  <p className="mt-1 text-[11px] text-muted">
                    {messageCategoryLabels[item.category] ?? item.category}
                  </p>
                </div>
                {item.scheduledAt && (
                  <time className="ml-auto text-xs">
                    {formatTime(item.scheduledAt)}
                  </time>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {summary && (
        <section className="mt-7 flex min-h-23 items-center justify-between gap-5 rounded-[13px] bg-highlight px-6 py-5 text-link max-[800px]:flex-col max-[800px]:items-start">
          <div>
            <h3 className="mb-1.5 text-[17px] font-semibold">
              {automationActive ? "Automações ativas" : "Automações pausadas"}
            </h3>
            <p className="text-[13px] text-muted">
              {automationActive
                ? "Lembretes e relatórios estão sendo processados automaticamente."
                : "Ative as automações em Configurações para enviar lembretes e processar relatórios."}
            </p>
          </div>
          <Link className="text-[13px] whitespace-nowrap" to="/automacoes">
            Ver automações →
          </Link>
        </section>
      )}
    </>
  );
}
