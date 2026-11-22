import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Search, TriangleAlert, X } from "lucide-react";
import { apiErrorMessage } from "../services/api";
import {
  fetchMessages,
  fetchWhatsappStatus,
  retryMessage,
  type Message,
  type WhatsappStatus,
} from "../services/messages";
import { daysFromToday, formatSendTime } from "../utils/formatDate";
import {
  badgeClasses,
  messageCategoryLabels,
  messageStatusLabels,
} from "../utils/labels";

type Group = "all" | "scheduled" | "sent" | "failed";

const groups: Record<Group, { label: string; statuses?: string[] }> = {
  all: { label: "Todas" },
  scheduled: {
    label: "Agendadas",
    statuses: ["SCHEDULED", "PENDING", "PROCESSING"],
  },
  sent: { label: "Enviadas", statuses: ["SENT", "DELIVERED"] },
  failed: { label: "Falhas", statuses: ["FAILED"] },
};
const groupKeys = Object.keys(groups) as Group[];

const inGroup = (m: Message, group: Group) => {
  const statuses = groups[group].statuses;
  return !statuses || statuses.includes(m.status);
};

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; messages: Message[] };

type ConnectionState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; connection: WhatsappStatus };

function ConnectionCard() {
  const [state, setState] = useState<ConnectionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchWhatsappStatus()
      .then((connection) => {
        if (!cancelled) setState({ status: "ready", connection });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  let tone = "bg-warning-bg text-warning-fg";
  let icon = <TriangleAlert size={22} />;
  let title = "Verificando conexão do WhatsApp...";
  let detail = "Aguarde um instante.";
  let canReconnect = false;

  if (state.status === "error") {
    title = "Não foi possível verificar a conexão do WhatsApp";
    detail = "Tente novamente em instantes.";
  } else if (state.status === "ready") {
    const { connection } = state;
    if (!connection.enabled) {
      title = "Integração do WhatsApp desativada";
      detail = "Os envios automáticos não estão habilitados neste ambiente.";
    } else if (connection.connected) {
      tone = "bg-success-bg text-success-fg";
      icon = <Check size={22} />;
      title = "WhatsApp Business conectado";
      detail = "Conexão ativa";
      canReconnect = true;
    } else {
      tone = "bg-danger-bg text-danger-fg";
      icon = <X size={22} />;
      title = "WhatsApp Business desconectado";
      detail = "Reconecte para retomar os envios automáticos.";
      canReconnect = true;
    }
  }

  return (
    <section
      aria-label="Conexão do WhatsApp"
      className="mb-8 flex items-center gap-4 rounded-[13px] bg-surface p-5 text-card-foreground"
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-full ${tone}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted">{detail}</p>
      </div>
      {canReconnect && (
        <Link
          to="/mensagens/reconectar"
          className="px-4 text-base font-semibold text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
        >
          Reconectar
        </Link>
      )}
    </section>
  );
}

export default function MessagesListPage() {
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [period, setPeriod] = useState("");
  const [retryError, setRetryError] = useState("");

  const load = useCallback(
    () =>
      fetchMessages()
        .then((messages) => setState({ status: "ready", messages }))
        .catch(() => setState({ status: "error" })),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const messages = state.status === "ready" ? state.messages : [];
  const types = [...new Set(messages.map((m) => m.category))];

  const visible = messages.filter(
    (m) =>
      normalize(`${m.patient.fullName} ${messageCategoryLabels[m.category]}`).includes(
        normalize(search.trim()),
      ) &&
      (!type || m.category === type) &&
      inGroup(m, group) &&
      (!period || daysFromToday(m.scheduledAt ?? m.createdAt) <= Number(period)),
  );

  async function retry(id: string) {
    setRetryError("");
    try {
      await retryMessage(id);
      await load();
    } catch (err) {
      setRetryError(
        apiErrorMessage(
          err,
          "Não foi possível reenviar. Verifique se o paciente está ativo e autorizou o WhatsApp.",
        ),
      );
    }
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
          Mensagens
        </h2>
        <p className="text-sm leading-6 text-muted">
          Acompanhe envios e mantenha o WhatsApp conectado.
        </p>
      </header>

      <ConnectionCard />

      <h3 className="mb-3 text-2xl font-semibold text-foreground">
        Mensagens
      </h3>

      <div className="mb-5 flex flex-wrap gap-4">
        {groupKeys.map((key) => (
          <div
            key={key}
            className="min-w-35 rounded-xl bg-surface p-4 text-left text-card-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
          >
            <span className="text-sm text-muted">
              {groups[key].label}
            </span>
            <p className="block text-[28px] leading-10 text-foreground font-semibold  ">
              {messages.filter((m) => inGroup(m, key)).length}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="flex min-h-12 min-w-57 flex-1 items-center gap-3 rounded-lg bg-surface px-5 text-muted focus-within:outline-2 focus-within:outline-link">
          <Search size={20} />
          <input
            type="search"
            aria-label="Buscar mensagens"
            placeholder="Buscar paciente ou mensagem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-base text-card-foreground outline-none placeholder:text-placeholder"
          />
        </label>

        <select
            aria-label="Tipo" 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-12 cursor-pointer rounded-lg bg-background px-3 text-base text-muted focus-visible:outline-2 focus-visible:outline-link" 
        >
          <option value="">Tipo</option>
          {types.map((t) => (
            <option key={t} value={t}>{messageCategoryLabels[t]}</option>
          ))}
        </select>

        <select
            aria-label="Status"
            value={group}
            onChange={(e) => setGroup(e.target.value as Group)}
            className="h-12 cursor-pointer rounded-lg bg-background px-3 text-base text-muted focus-visible:outline-2 focus-visible:outline-link"
        >
          <option value="all">Status</option>
          {groupKeys.filter((k) => k !== "all").map((k) => (
            <option key={k} value={k}>{groups[k].label}</option>
          ))}
        </select>

        <select
            aria-label="Período"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-12 cursor-pointer rounded-lg bg-background px-3 text-base text-muted focus-visible:outline-2 focus-visible:outline-link"
        >
          <option value="">Período</option>
          <option value="0">Hoje</option>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
        </select>
      </div>

      {retryError && (
        <p role="alert" className="mb-4 text-sm text-danger-fg">
          {retryError}
        </p>
      )}

      <section aria-label="Lista de mensagens" className="overflow-hidden rounded-xl bg-surface text-card-foreground px-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left text-sm">
            <thead className="h-13 text-sm text-primary">
              <tr>
                <th className="px-4 py-3 font-semibold">PACIENTE</th>
                <th className="px-4 py-3 font-semibold">MENSAGEM</th>
                <th className="px-4 py-3 font-semibold">ENVIO</th>
                <th className="px-4 py-3 font-semibold">STATUS</th>
                <th className="px-4 py-3 font-semibold"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>

            <tbody>
              {visible.map((m) => {
                const [statusLabel, statusColor] = messageStatusLabels[m.status];
                return (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link
                        to={`/mensagens/${m.id}`}
                        className="font-semibold hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
                      >
                        {m.patient.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{messageCategoryLabels[m.category]}</td>
                    <td className="px-4 py-3 text-muted">{formatSendTime(m.scheduledAt ?? m.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block min-w-26 rounded-full px-3 py-1.5 text-center ${badgeClasses[statusColor]}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.status === "FAILED" && (
                        <button
                          type="button"
                          onClick={() => retry(m.id)}
                          className="cursor-pointer font-semibold text-danger-fg"
                        >
                          Tentar novamente
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {state.status === "loading" && (
          <p role="status" className="p-10 text-center text-muted">
            Carregando mensagens...
          </p>
        )}

        {state.status === "error" && (
          <p role="alert" className="p-10 text-center text-danger-fg">
            Não foi possível carregar as mensagens.{" "}
            <button
              type="button"
              className="cursor-pointer font-semibold underline"
              onClick={() => {
                setState({ status: "loading" });
                load();
              }}
            >
              Tentar novamente
            </button>
          </p>
        )}

        {state.status === "ready" && visible.length === 0 && (
          <p role="status" className="p-10 text-center text-muted">
            Nenhuma mensagem encontrada. Tente outra busca ou limpe os filtros.
          </p>
        )}
      </section>
    </>
  );
}