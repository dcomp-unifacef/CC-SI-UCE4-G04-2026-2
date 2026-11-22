import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, FileText, Pause, Play } from "lucide-react";
import { apiErrorMessage } from "../services/api";
import {
  fetchJobs,
  fetchScheduledMessages,
  retryJob,
  type Job,
} from "../services/automations";
import { fetchSummary, type SummaryResponse } from "../services/dashboard";
import {
  fetchPortals,
  updatePortal,
  updateSettings,
  type Portal,
} from "../services/settings";
import { daysFromToday, formatDate, formatSendTime, formatTime } from "../utils/formatDate";
import { jobStatusLabels, jobTypeLabels, portalLabels } from "../utils/labels";

function when(iso: string) {
  const diff = daysFromToday(iso);
  if (diff === 0) return formatTime(iso);
  if (diff === 1) return "Ontem";
  return formatDate(iso);
}

function jobSummary(job: Job) {
  return job.patient?.fullName ?? job.report?.originalName ?? "-";
}

type Data = {
  summary: SummaryResponse;
  portals: Portal[];
  jobs: Job[];
  nextMessage: { next: string | null; total: number };
};

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: Data };

export default function AutomationsListPage() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  const [actionError, setActionError] = useState("");

  const load = useCallback(
    () =>
      Promise.all([fetchSummary(), fetchPortals(), fetchJobs(10), fetchScheduledMessages()])
        .then(([summary, portals, jobs, nextMessage]) =>
          setState({ status: "ready", data: { summary, portals, jobs, nextMessage } }),
        )
        .catch(() => setState({ status: "error" })),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === "loading") {
    return <p className="text-muted">Carregando...</p>;
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="text-danger-fg">
        Não foi possível carregar as automações.{" "}
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
    );
  }

  const { summary, portals, jobs, nextMessage } = state.data;
  const paused = !summary.automation.messagesEnabled;
  const alerts = summary.reportsFailed;
  const nextRun = nextMessage.next
    ? `${formatSendTime(nextMessage.next)} · ${nextMessage.total} ${nextMessage.total === 1 ? "mensagem" : "mensagens"}`
    : "Nenhuma mensagem agendada";

  async function changeAutomation(enabled: boolean) {
    setActionError("");
    try {
      await updateSettings({
        messageAutomationEnabled: enabled,
        reportAutomationEnabled: enabled,
      });
      dialog.current?.close();
      await load();
    } catch (err) {
      setActionError(apiErrorMessage(err, "Não foi possível alterar as automações."));
    }
  }

  async function retry(id: string) {
    setActionError("");
    try {
      await retryJob(id);
      await load();
    } catch (err) {
      setActionError(apiErrorMessage(err, "Não foi possível reprocessar a tarefa."));
    }
  }

  async function togglePortal(portal: Portal) {
    setActionError("");
    try {
      await updatePortal(portal.platform, !portal.isEnabled);
      await load();
    } catch (err) {
      setActionError(apiErrorMessage(err, "Não foi possível alterar o conector."));
    }
  }

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-x-5 gap-y-3.5">
        <div>
          <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">Automações</h2>
          <p className="text-sm leading-6 text-muted">Status, próximas execuções e histórico dos processos.</p>
        </div>

        <button
          type="button"
          onClick={paused ? () => changeAutomation(true) : () => dialog.current?.showModal()}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />} {paused ? "Retomar todas" : "Pausar todas"}
        </button>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-5 max-[800px]:grid-cols-1">
        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-highlight text-link">
              <Clock size={22} />
            </span>
            <h3 className="flex-1 text-xl font-semibold">Lembretes WhatsApp</h3>
            <span
              className={`rounded-full px-4 py-1.5 text-sm ${
                paused ? "bg-warning-bg text-warning-fg" : "bg-success-bg text-success-fg"
              }`}
            >
              {paused ? "Pausada" : "Ativa"}
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Próxima execução</p>
              <p className="text-lg font-semibold">{paused ? "Pausada até a retomada" : nextRun}</p>
            </div>
            <Link to="/configuracoes/lembretes" className="text-sm font-semibold text-link">Ver regras →</Link>
          </div>
        </section>

        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-warning-bg text-warning-fg">
              <FileText size={22} />
            </span>
            <h3 className="flex-1 text-xl font-semibold">Relatórios mensais</h3>
            <span className={`rounded-full px-4 py-1.5 text-sm ${alerts === 0 ? "bg-success-bg text-success-fg" : "bg-warning-bg text-warning-fg"}`}>
              {alerts === 0 ? "Sem alertas" : `${alerts} ${alerts === 1 ? "alerta" : "alertas"}`}
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Aguardando revisão</p>
              <p className="text-lg font-semibold">
                {summary.reportsPending} {summary.reportsPending === 1 ? "relatório" : "relatórios"}
              </p>
            </div>
            <a href="#conectores" className="text-sm font-semibold text-link">Ver conectores →</a>
          </div>
        </section>
      </div>

      <h3 id="conectores" className="mb-4 scroll-mt-6 text-[28px] font-semibold text-foreground">
        Conectores de relatórios
      </h3>

      <ul className="mb-10 grid gap-3">
        {portals.map((c) => (
          <li key={c.platform} className="rounded-[13px] bg-surface p-6 text-card-foreground grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.5fr)] items-center gap-4 max-[800px]:grid-cols-1 max-[800px]:gap-1 py-5">
            <p className="flex items-center gap-4 font-semibold">
              <span
                aria-hidden
                className={`size-3 shrink-0 rounded-full ${c.isEnabled ? "bg-success-fg" : "bg-warning-fg"}`}
              />
              {portalLabels[c.platform]}
            </p>

            <p className={`font-semibold ${c.isEnabled ? "text-success-fg" : "text-warning-fg"}`}>
              {c.isEnabled ? "Ativo" : "Desativado"}
            </p>

            <p className="text-sm text-muted">
              {c.lastRunAt ? formatSendTime(c.lastRunAt) : "Nunca sincronizado"}
            </p>

            <div>
              <button
                type="button"
                onClick={() => togglePortal(c)}
                className="cursor-pointer text-xs font-semibold text-link"
              >
                {c.isEnabled ? "Desativar" : "Ativar"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mb-4 text-[28px] font-semibold text-foreground">Execuções recentes</h3>

      <section className="rounded-[13px] bg-surface p-6 text-card-foreground grid gap-6 py-7" aria-label="Execuções recentes">
        {jobs.map((r) => {
          const [statusLabel, statusColor] = jobStatusLabels[r.status];
          const failed = r.status === "FAILED";
          return (
            <div key={r.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.5fr)] items-center gap-4 max-[800px]:grid-cols-1 max-[800px]:gap-1">
              <Link to={`/automacoes/${r.id}`} className="font-semibold hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link">
                {jobTypeLabels[r.type]}
              </Link>

              <span className="text-sm text-muted">{jobSummary(r)}</span>

              <span className={`text-sm font-semibold ${statusColor === "danger" ? "text-danger-fg" : ""}`}>
                {statusLabel} · {when(r.finishedAt ?? r.startedAt ?? r.createdAt)}
              </span>

              <div>
                {failed && r.attempts < r.maxAttempts && (
                  <button type="button" onClick={() => retry(r.id)} className="cursor-pointer text-left text-sm font-semibold text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link">
                    Tentar novamente
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {jobs.length === 0 && (
          <p role="status" className="text-center text-muted">Nenhuma execução registrada ainda.</p>
        )}
      </section>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-danger-fg">{actionError}</p>
      )}

      <dialog
        ref={dialog}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[20px] bg-surface p-8 text-card-foreground backdrop:bg-[#17384a]"
      >
        <span className="grid size-13 place-items-center rounded-full bg-warning-bg text-warning-fg">
          <Pause size={22} />
        </span>

        <h2 className="mt-6 text-2xl font-bold text-foreground">Pausar automações?</h2>
        <p className="mt-3 text-[15px] leading-6 text-muted">
          Novos lembretes e relatórios automáticos deixarão de ser enviados até a retomada. Mensagens já enviadas não serão afetadas.
        </p>

        <p className="mt-6 rounded-lg bg-background px-5 py-4 text-sm font-semibold">
          A agenda continuará calculada e poderá ser consultada.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => dialog.current?.close()} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link text-muted">
            Manter ativas
          </button>
          <button type="button" onClick={() => changeAutomation(false)} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link bg-warning-fg text-background">
            Pausar automações
          </button>
        </div>
      </dialog>
    </>
  );
}