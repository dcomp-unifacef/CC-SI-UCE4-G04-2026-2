import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import { RotateCw } from "lucide-react";
import { apiErrorMessage } from "../services/api";
import { fetchJob, retryJob, type Job } from "../services/automations";
import { formatDate, formatTime } from "../utils/formatDate";
import { jobStatusLabels, jobTypeLabels, reportPlatformLabels } from "../utils/labels";

type LogLevel = "INFO" | "WARN" | "ERROR";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error" }
  | { status: "ready"; job: Job };

const levelStyle: Record<LogLevel, string> = {
  INFO: "text-muted",
  WARN: "text-warning-fg",
  ERROR: "bg-danger-bg text-danger-fg",
};

const clock = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function formatDuration(start: string | null, end: string | null) {
  if (!start || !end) return "-";
  const total = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

function buildLog(job: Job) {
  const log: { time: string; message: string; level: LogLevel }[] = [
    { time: clock.format(new Date(job.createdAt)), message: "Tarefa criada", level: "INFO" },
  ];
  if (job.startedAt) {
    log.push({ time: clock.format(new Date(job.startedAt)), message: "Execução iniciada", level: "INFO" });
  }
  if (job.finishedAt) {
    const failed = job.status === "FAILED";
    log.push({
      time: clock.format(new Date(job.finishedAt)),
      message: failed ? "Execução encerrada com falha" : "Execução encerrada",
      level: failed ? "ERROR" : "INFO",
    });
  }
  return log;
}

function RunDetailsView({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  const load = useCallback(
    () =>
      fetchJob(id)
        .then((job) => setState({ status: "ready", job }))
        .catch((err) => {
          const notFound =
            isAxiosError(err) &&
            (err.response?.status === 404 || err.response?.status === 400);
          setState({ status: notFound ? "notFound" : "error" });
        }),
    [id],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === "loading") {
    return <p className="text-muted">Carregando...</p>;
  }

  if (state.status !== "ready") {
    return (
      <p className="text-muted">
        {state.status === "notFound"
          ? "Execução não encontrada."
          : "Não foi possível carregar a execução."}{" "}
        <Link className="text-link" to="/automacoes">Voltar para automações</Link>
      </p>
    );
  }

  const { job } = state;
  const failed = job.status === "FAILED";
  const canRetry = failed && job.attempts < job.maxAttempts;
  const [statusLabel] = jobStatusLabels[job.status];
  const moment = job.finishedAt ?? job.startedAt ?? job.createdAt;
  const log = buildLog(job);

  async function retry() {
    setRetrying(true);
    setRetryError("");
    try {
      await retryJob(id);
      await load();
    } catch (err) {
      setRetryError(apiErrorMessage(err, "Não foi possível reprocessar a tarefa."));
    }
    setRetrying(false);
  }

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-x-5 gap-y-3.5">
        <div>
          <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
            {failed ? "Execução com falha" : `Execução: ${statusLabel.toLowerCase()}`}
          </h2>
          <p className="text-sm leading-6 text-muted">
            {jobTypeLabels[job.type]} · {formatDate(moment)}, {formatTime(moment)}
          </p>
        </div>

        {failed && (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-danger-bg px-5 py-2.5 text-sm text-danger-fg">Falhou</span>
            <button
              type="button"
              onClick={retry}
              disabled={!canRetry || retrying}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:cursor-default disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
            >
              <RotateCw size={16} /> {retrying ? "Solicitando..." : "Tentar de novo"}
            </button>
          </div>
        )}
      </header>

      <section className="rounded-[13px] bg-surface p-6 text-card-foreground mb-5">
        <dl className="grid grid-cols-4 gap-6 max-[800px]:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Paciente</dt>
            <dd className="mt-1 text-lg font-semibold">{job.patient?.fullName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Plataforma</dt>
            <dd className="mt-1 text-lg font-semibold">
              {job.report ? reportPlatformLabels[job.report.platform] : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Duração</dt>
            <dd className="mt-1 text-lg font-semibold">{formatDuration(job.startedAt, job.finishedAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Tentativas</dt>
            <dd className="mt-1 text-lg font-semibold">{job.attempts} de {job.maxAttempts}</dd>
          </div>
        </dl>
      </section>

      {failed && (
        <div role="alert" className="mb-5 rounded-xl bg-danger-bg p-6 text-danger-fg">
          <h3 className="text-xl font-semibold">Falha na execução</h3>
          <p className="mt-1">Esta tarefa não foi concluída. Nenhum envio foi confirmado.</p>
          <p className="mt-2 text-sm">
            {canRetry
              ? "Próxima ação: tentar novamente esta tarefa."
              : "O limite de tentativas foi atingido. Verifique o item de origem antes de reenviar."}
          </p>
          {retryError && <p className="mt-2 text-sm font-semibold">{retryError}</p>}
        </div>
      )}

      <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
        <h3 className="text-xl font-semibold">Log da execução</h3>
        <p className="mb-5 text-sm text-muted">Horários no fuso do seu navegador · dados sensíveis omitidos</p>

        <ol className="grid gap-2 text-sm">
          {log.map((entry, i) => (
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

export default function AutomationRunDetails() {
  const { id } = useParams();
  if (!id) return null;
  return <RunDetailsView key={id} id={id} />;
}
