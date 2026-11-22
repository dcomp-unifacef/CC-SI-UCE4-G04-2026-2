import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Search } from "lucide-react";
import { messages as initialMessages } from "../data/messages";
import type { Message, MessageStatus } from "../data/messages";
import { daysFromToday, formatSendTime } from "../utils/formatDate";

type Group = "all" | "scheduled" | "sent" | "failed";

// Os cards de resumo e o select "Status" usam o mesmo estado
const groups: Record<Group, { label: string; statuses?: MessageStatus[] }> = {
  all: { label: "Todas" },
  scheduled: { label: "Agendadas", statuses: ["scheduled", "waiting"] },
  sent: { label: "Enviadas", statuses: ["sent"] },
  failed: { label: "Falhas", statuses: ["failed"] },
};
const groupKeys = Object.keys(groups) as Group[];

const badge: Record<MessageStatus, { label: string; className: string }> = {
  scheduled: { label: "Agendada", className: "bg-warning-bg text-warning-fg" },
  waiting: { label: "Aguardando", className: "bg-warning-bg text-warning-fg" },
  sent: { label: "Enviada", className: "bg-success-bg text-success-fg" },
  failed: { label: "Falhou", className: "bg-danger-bg text-danger-fg" },
};

const inGroup = (m: Message, group: Group) => {
  const statuses = groups[group].statuses;
  return !statuses || statuses.includes(m.status);
};

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function MessagesListPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [period, setPeriod] = useState("");

  const types = [...new Set(messages.map((m) => m.type))];

  const visible = messages.filter(
    (m) =>
      normalize(`${m.patient} ${m.title}`).includes(normalize(search.trim())) &&
      (!type || m.type === type) &&
      inGroup(m, group) &&
      (!period || daysFromToday(m.scheduledAt) <= Number(period)),
  );

  function retry(id: number) {
    // TODO: pedir o reenvio à API
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "waiting" } : m)));
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

      {/* TODO: status real da conexão vindo da API */}
      <section
        aria-label="Conexão do WhatsApp"
        className="mb-8 flex items-center gap-4 rounded-[13px] bg-surface p-5 text-card-foreground"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-success-bg text-success-fg">
          <Check size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">
            WhatsApp Business conectado
          </h3>
          <p className="text-sm text-muted">
            Instância sono-inteligente · Conectado agora
          </p>
        </div>
        <Link
          to="/mensagens/reconectar"
          className="px-4 text-base font-semibold text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
        >
          Reconectar
        </Link>
      </section>

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
          {types.map((t) => <option key={t}>{t}</option>)}
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

      <section aria-label="Lista de mensagens" className="overflow-hidden rounded-xl bg-surface text-card-foreground">
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
              {visible.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link
                      to={`/mensagens/${m.id}`}
                      className="font-semibold hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
                    >
                      {m.patient}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{m.title}</td>
                  <td className="px-4 py-3 text-muted">{formatSendTime(m.scheduledAt)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-block min-w-26 rounded-full px-3 py-1.5 text-center ${badge[m.status].className}`}>
                      {badge[m.status].label}
                    </span>
                  </td>
                  <td className={"px-4 py-3 text-right"}>
                    {m.status === "failed" && (
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
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <p role="status" className="p-10 text-center text-muted">
            Nenhuma mensagem encontrada. Tente outra busca ou limpe os filtros.
          </p>
        )}
      </section>
    </>
  );
}