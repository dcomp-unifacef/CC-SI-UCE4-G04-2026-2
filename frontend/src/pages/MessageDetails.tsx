import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RotateCw } from "lucide-react";
import { messages } from "../data/messages";
import { formatDate, formatTime } from "../utils/formatDate";

export default function MessageDetails() {
  const { id } = useParams();
  const message = messages.find((m) => m.id === Number(id));
  const [resent, setResent] = useState(false);

  if (!message) {
    return (
      <p className="text-muted">
        Mensagem não encontrada. <Link className="text-link" to="/mensagens">Voltar para a lista</Link>
      </p>
    );
  }

  function resend() {
    // TODO: pedir o reenvio à API (cria uma nova tentativa no histórico)
    setResent(true);
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">{message.title}</h2>
        <p className="text-sm leading-6 text-muted">
          Mensagem #MSG-{message.id} · Criada {formatDate(message.createdAt)}, {formatTime(message.createdAt)}
        </p>
      </header>

      {message.status === "failed" && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-danger-bg p-6 text-danger-fg">
          <div>
            <h3 className="text-lg font-semibold">Falha no envio</h3>
            <p className="text-sm">{message.error}</p>
          </div>

          <button
            type="button"
            onClick={resend}
            disabled={resent}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:cursor-default disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
          >
            <RotateCw size={16} /> {resent ? "Reenvio solicitado" : "Reenviar"}
          </button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-5 max-[800px]:grid-cols-1">
        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <dl className="grid grid-cols-2 gap-y-5">
            <div className="col-span-2">
              <dt className="text-sm text-muted">Paciente</dt>
              <dd className="text-lg font-semibold">{message.patient}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">WhatsApp</dt>
              <dd className="font-semibold">{message.phone}</dd>
            </div>
            <div className="self-end">
              <dd className={`text-sm font-semibold ${message.followUpActive ? "text-success-fg" : "text-warning-fg"}`}>
                {message.followUpActive ? "Acompanhamento ativo" : "Acompanhamento pausado"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <dl className="grid gap-y-5">
            <div>
              <dt className="text-sm text-muted">Agendamento</dt>
              <dd className="text-lg font-semibold">
                {formatDate(message.scheduledAt)} · {formatTime(message.scheduledAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Tipo de regra</dt>
              <dd className="font-semibold">{message.rule}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="mb-6 grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5 max-[1190px]:grid-cols-1">
        <section>
          <h3 className="mb-3 text-xl font-semibold text-foreground">O que foi enviado</h3>
          <div className={`rounded-[13px] bg-surface p-6 text-card-foreground flex min-h-64 flex-col justify-between gap-8`}>
            <p className="text-[15px] leading-7 whitespace-pre-line">{message.body}</p>
            <small className="text-xs text-muted">Modelo: {message.template}</small>
          </div>
        </section>

        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <h3 className="mb-5 text-xl font-semibold">Histórico de tentativas</h3>
          <ol className="space-y-4 text-sm">
            {message.attempts.map((attempt, i) => (
              <li key={i} className={attempt.failed ? "font-semibold text-danger-fg" : "text-muted"}>
                {attempt.time} · {attempt.label}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <p className="rounded-xl bg-highlight p-6 text-sm font-semibold text-card-foreground">
        Reenvio manual cria uma nova tentativa e fica registrado no histórico.
      </p>
    </>
  );
}