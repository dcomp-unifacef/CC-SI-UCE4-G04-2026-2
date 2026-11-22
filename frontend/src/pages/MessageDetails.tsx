import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import { RotateCw } from "lucide-react";
import { apiErrorMessage } from "../services/api";
import { fetchMessage, retryMessage, type Message } from "../services/messages";
import { formatDate, formatTime } from "../utils/formatDate";
import { messageCategoryLabels, formatPhone } from "../utils/labels";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error" }
  | { status: "ready"; message: Message };

type Attempt = { time: string; label: string; failed?: boolean };

function buildAttempts(message: Message): Attempt[] {
  const attempts: Attempt[] = [
    { time: formatTime(message.createdAt), label: "Envio agendado" },
  ];
  if (message.sentAt) {
    attempts.push({ time: formatTime(message.sentAt), label: "Mensagem enviada" });
  }
  if (message.status === "FAILED") {
    attempts.push({
      time: formatTime(message.updatedAt),
      label: `Falha no envio (${message.attemptCount} ${message.attemptCount === 1 ? "tentativa" : "tentativas"})`,
      failed: true,
    });
  }
  return attempts;
}

function MessageDetailsView({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");

  const load = useCallback(
    () =>
      fetchMessage(id)
        .then((message) => setState({ status: "ready", message }))
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
          ? "Mensagem não encontrada."
          : "Não foi possível carregar a mensagem."}{" "}
        <Link className="text-link" to="/mensagens">Voltar para a lista</Link>
      </p>
    );
  }

  const { message } = state;
  const title = messageCategoryLabels[message.category];
  const scheduledAt = message.scheduledAt ?? message.createdAt;
  const followUpActive = message.patient.status === "ACTIVE";
  const attempts = buildAttempts(message);

  async function resend() {
    setResending(true);
    setResendError("");
    try {
      await retryMessage(id);
      await load();
    } catch (err) {
      setResendError(
        apiErrorMessage(
          err,
          "Não foi possível reenviar. Verifique se o paciente está ativo e autorizou o WhatsApp.",
        ),
      );
    }
    setResending(false);
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">{title}</h2>
        <p className="text-sm leading-6 text-muted">
          Mensagem #MSG-{message.id.slice(0, 8).toUpperCase()} · Criada {formatDate(message.createdAt)}, {formatTime(message.createdAt)}
        </p>
      </header>

      {message.status === "FAILED" && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-danger-bg p-6 text-danger-fg">
          <div>
            <h3 className="text-lg font-semibold">Falha no envio</h3>
            <p className="text-sm">
              {resendError || "O WhatsApp não confirmou a entrega desta mensagem. Tente reenviar."}
            </p>
          </div>

          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:cursor-default disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
          >
            <RotateCw size={16} /> {resending ? "Reenviando..." : "Reenviar"}
          </button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-5 max-[800px]:grid-cols-1">
        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <dl className="grid grid-cols-2 gap-y-5">
            <div className="col-span-2">
              <dt className="text-sm text-muted">Paciente</dt>
              <dd className="text-lg font-semibold">{message.patient.fullName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">WhatsApp</dt>
              <dd className="font-semibold">{formatPhone(message.patient.phone)}</dd>
            </div>
            <div className="self-end">
              <dd className={`text-sm font-semibold ${followUpActive ? "text-success-fg" : "text-warning-fg"}`}>
                {followUpActive ? "Acompanhamento ativo" : "Acompanhamento pausado"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <dl className="grid gap-y-5">
            <div>
              <dt className="text-sm text-muted">Agendamento</dt>
              <dd className="text-lg font-semibold">
                {formatDate(scheduledAt)} · {formatTime(scheduledAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Categoria</dt>
              <dd className="font-semibold">{title}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="mb-6 grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5 max-[1190px]:grid-cols-1">
        <section>
          <h3 className="mb-3 text-xl font-semibold text-foreground">O que foi enviado</h3>
          <div className={`rounded-[13px] bg-surface p-6 text-card-foreground flex min-h-64 flex-col justify-between gap-8`}>
            <p className="text-[15px] leading-7 whitespace-pre-line">{message.contentSnapshot}</p>
            <small className="text-xs text-muted">Modelo: {message.template?.name ?? "mensagem avulsa"}</small>
          </div>
        </section>

        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <h3 className="mb-5 text-xl font-semibold">Histórico de tentativas</h3>
          <ol className="space-y-4 text-sm">
            {attempts.map((attempt, i) => (
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

export default function MessageDetails() {
  const { id } = useParams();
  if (!id) return null;
  return <MessageDetailsView key={id} id={id} />;
}
