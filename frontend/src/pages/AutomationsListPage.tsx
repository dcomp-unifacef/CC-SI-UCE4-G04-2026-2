import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, FileText, Pause, Play } from "lucide-react";
import { connectors, monthlyReports, reminders, runs as initialRuns } from "../data/automations";
import type { RunStatus } from "../data/automations";
import { daysFromToday, formatDate, formatSendTime, formatTime } from "../utils/formatDate";

const runLabel: Record<RunStatus, string> = { done: "Concluída", failed: "Falhou", running: "Em execução" };

// Hoje mostra só o horário, ontem mostra "Ontem", antes disso a data
function when(iso: string) {
  const diff = daysFromToday(iso);
  if (diff === 0) return formatTime(iso);
  if (diff === 1) return "Ontem";
  return formatDate(iso);
}

export default function AutomationsListPage() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [paused, setPaused] = useState(false);
  const [runs, setRuns] = useState(initialRuns);

  function pauseAll() {
    // TODO: pausar as automações na API
    setPaused(true);
    dialog.current?.close();
  }

  function resumeAll() {
    // TODO: retomar as automações na API
    setPaused(false);
  }

  function retry(id: number) {
    // TODO: pedir o reprocessamento à API
    setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, status: "running" } : r)));
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
          onClick={paused ? resumeAll : () => dialog.current?.showModal()}
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
              <p className="text-lg font-semibold">{paused ? "Pausada até a retomada" : reminders.nextRun}</p>
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
            <span className="rounded-full bg-warning-bg px-4 py-1.5 text-sm text-warning-fg">
              {monthlyReports.alerts} alertas
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Próxima execução</p>
              <p className="text-lg font-semibold">{monthlyReports.nextRun}</p>
            </div>
            <a href="#conectores" className="text-sm font-semibold text-link">Ver conectores →</a>
          </div>
        </section>
      </div>

      <h3 id="conectores" className="mb-4 scroll-mt-6 text-[28px] font-semibold text-foreground">
        Conectores de relatórios
      </h3>

      <ul className="mb-10 grid gap-3">
        {connectors.map((c) => (
          <li key={c.id} className="rounded-[13px] bg-surface p-6 text-card-foreground grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.5fr)] items-center gap-4 max-[800px]:grid-cols-1 max-[800px]:gap-1 py-5">
            <p className="flex items-center gap-4 font-semibold">
              <span
                aria-hidden
                className={`size-3 shrink-0 rounded-full ${c.status === "connected" ? "bg-success-fg" : "bg-warning-fg"}`}
              />
              {c.name}
            </p>

            <p className={`font-semibold ${c.status === "connected" ? "text-success-fg" : "text-warning-fg"}`}>
              {c.status === "connected" ? "Conectado" : "Atenção necessária"}
            </p>

            <p className="text-sm text-muted">{formatSendTime(c.lastSync)}</p>

            <div>
              {c.runId && (
                <Link to={`/automacoes/${c.runId}`} className="text-xs font-semibold text-link">
                  Detalhes / tentar novamente →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mb-4 text-[28px] font-semibold text-foreground">Execuções recentes</h3>

      <section className="rounded-[13px] bg-surface p-6 text-card-foreground grid gap-6 py-7" aria-label="Execuções recentes">
        {runs.map((r) => (
          <div key={r.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.5fr)] items-center gap-4 max-[800px]:grid-cols-1 max-[800px]:gap-1">
            {r.detail ? (
              <Link to={`/automacoes/${r.id}`} className="font-semibold hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link">
                {r.name}
              </Link>
            ) : (
              <span className="font-semibold">{r.name}</span>
            )}

            <span className="text-sm text-muted">{r.summary}</span>

            <span className={`text-sm font-semibold ${r.status === "failed" ? "text-danger-fg" : ""}`}>
              {runLabel[r.status]} · {when(r.at)}
            </span>

            <div>
              {r.status === "failed" && (
                <button type="button" onClick={() => retry(r.id)} className="cursor-pointer text-left text-sm font-semibold text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link">
                  Retry
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      <dialog
        ref={dialog}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[20px] bg-surface p-8 text-card-foreground backdrop:bg-[#17384a]"
      >
        <span className="grid size-13 place-items-center rounded-full bg-warning-bg text-warning-fg">
          <Pause size={22} />
        </span>

        <h2 className="mt-6 text-2xl font-bold text-foreground">Pausar lembretes automáticos?</h2>
        <p className="mt-3 text-[15px] leading-6 text-muted">
          Novos lembretes deixarão de ser enviados até a retomada. Mensagens já enviadas não serão afetadas.
        </p>

        <p className="mt-6 rounded-lg bg-background px-5 py-4 text-sm font-semibold">
          A agenda continuará calculada e poderá ser consultada.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => dialog.current?.close()} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link text-muted">
            Manter ativa
          </button>
          <button type="button" onClick={pauseAll} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link bg-warning-fg text-background">
            Pausar automação
          </button>
        </div>
      </dialog>
    </>
  );
}