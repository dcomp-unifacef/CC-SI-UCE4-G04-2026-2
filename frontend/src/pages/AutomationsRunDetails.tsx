import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RotateCw } from "lucide-react";
import { runs } from "../data/automations";
import type { LogLevel } from "../data/automations";
import { formatDate, formatTime } from "../utils/formatDate";

const levelStyle: Record<LogLevel, string> = {
  INFO: "text-muted",
  WARN: "text-warning-fg",
  ERROR: "bg-danger-bg text-danger-fg",
};

export default function AutomationRunDetails() {
  const { id } = useParams();
  const [retried, setRetried] = useState(false);
  const run = runs.find((r) => r.id === Number(id));
  const detail = run?.detail;

  if (!run || !detail) {
    return (
      <p className="text-muted">
        Execução não encontrada. <Link className="text-link" to="/automacoes">Voltar para automações</Link>
      </p>
    );
  }

  const failed = run.status === "failed";

  function retry() {
    // TODO: pedir um novo processamento à API
    setRetried(true);
  }

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-x-5 gap-y-3.5">
        <div>
          <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
            {failed ? "Execução com falha" : "Execução concluída"}
          </h2>
          <p className="text-sm leading-6 text-muted">
            {detail.platform} · {detail.kind} · {formatDate(run.at)}, {formatTime(run.at)}
          </p>
        </div>

        {failed && (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-danger-bg px-5 py-2.5 text-sm text-danger-fg">Falhou</span>
            <button
              type="button"
              onClick={retry}
              disabled={retried}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:cursor-default disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
            >
              <RotateCw size={16} /> {retried ? "Nova tentativa solicitada" : "Tentar de novo"}
            </button>
          </div>
        )}
      </header>

      <section className="rounded-[13px] bg-surface p-6 text-card-foreground mb-5">
        <dl className="grid grid-cols-4 gap-6 max-[800px]:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Paciente</dt>
            <dd className="mt-1 text-lg font-semibold">{detail.patient}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Plataforma</dt>
            <dd className="mt-1 text-lg font-semibold">{detail.platform}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Duração</dt>
            <dd className="mt-1 text-lg font-semibold">{detail.duration}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Tentativas</dt>
            <dd className="mt-1 text-lg font-semibold">{detail.attempts}</dd>
          </div>
        </dl>
      </section>

      {failed && detail.errorTitle && (
        <div role="alert" className="mb-5 rounded-xl bg-danger-bg p-6 text-danger-fg">
          <h3 className="text-xl font-semibold">{detail.errorTitle}</h3>
          <p className="mt-1">{detail.errorText}</p>
          <p className="mt-2 text-sm">{detail.nextAction}</p>
        </div>
      )}

      <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
        <h3 className="text-xl font-semibold">Log da execução</h3>
        <p className="mb-5 text-sm text-muted">Horários em America/Sao_Paulo · dados sensíveis omitidos</p>

        <ol className="grid gap-2 text-sm">
          {detail.log.map((entry, i) => (
            <li
              key={i}
              className={`grid grid-cols-[90px_minmax(0,1fr)_60px] items-center gap-4 rounded-lg px-5 py-4 max-[800px]:grid-cols-[80px_minmax(0,1fr)] ${
                entry.level === "ERROR" ? "bg-danger-bg text-danger-fg" : "bg-background"
              }`}
            >
              <time className={entry.level === "ERROR" ? "" : "text-muted"}>{entry.time}</time>
              <span>{entry.message}</span>
              <span className={`text-xs font-semibold max-[800px]:hidden ${entry.level === "ERROR" ? "" : levelStyle[entry.level]}`}>
                {entry.level}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}