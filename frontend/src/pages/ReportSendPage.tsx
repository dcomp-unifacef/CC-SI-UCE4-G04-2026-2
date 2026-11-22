import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { apiErrorMessage } from "../services/api";
import { createMessage } from "../services/messages";
import {
  fetchReport,
  metricNumber,
  metricText,
  type Report,
} from "../services/reports";
import {
  formatFileSize,
  formatMonthLong,
  formatPeriod,
  formatPhone,
  reportPlatformLabels,
} from "../utils/labels";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error" }
  | { status: "ready"; report: Report };

function buildMessage(report: Report) {
  const firstName = report.patient?.fullName.split(" ")[0] ?? "";
  const month = report.periodStart ? formatMonthLong(report.periodStart) : "";
  const daysUsed = metricNumber(report, "days_used");
  const average = metricText(report, "average_daily_usage");
  const usage =
    daysUsed !== null && average
      ? `No período, foram registrados ${String(daysUsed).replace(".", ",")} dias de uso, com média diária de ${average}. `
      : "";
  return (
    `Olá, ${firstName}! 😊\n\n` +
    `Segue seu relatório mensal de acompanhamento${month ? ` referente a ${month}` : ""}.\n\n` +
    `${usage}O documento em PDF está anexado para você consultar.\n\n` +
    `Se tiver dúvidas, estamos à disposição.\nSono Inteligente`
  );
}

function ReportSendView({ id }: { id: string }) {
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      fetchReport(id)
        .then((report) => setState({ status: "ready", report }))
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
          ? "Relatório não encontrado."
          : "Não foi possível carregar o relatório."}{" "}
        <Link className="text-link" to="/relatorios">Voltar para a lista</Link>
      </p>
    );
  }

  const { report } = state;
  const patient = report.patient;
  const approved = report.status === "APPROVED" && patient !== null;
  const message = buildMessage(report);

  async function send() {
    if (!patient) return;
    setSending(true);
    setError("");
    try {
      const created = await createMessage({
        patientId: patient.id,
        category: "MONTHLY_REPORT",
        reportId: report.id,
        content: message,
      });
      navigate(`/mensagens/${created.id}`);
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 409
          ? "Não foi possível agendar o envio. Verifique se o paciente está ativo e autorizou mensagens no WhatsApp."
          : apiErrorMessage(err, "Não foi possível agendar o envio."),
      );
      setSending(false);
    }
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
          Pré-visualizar mensagem
        </h2>
        <p className="text-sm leading-6 text-muted">
          Confirme o destinatário, o conteúdo e o relatório antes do envio.
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 max-[1190px]:grid-cols-1">
        <div className="grid content-start gap-5">
          <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
            <p className="text-xs font-semibold text-muted uppercase">Destinatário</p>
            <h3 className="mt-1 text-xl font-semibold">{patient?.fullName ?? "Paciente não associado"}</h3>
            <p className="text-sm text-muted">{patient ? formatPhone(patient.phone) : "-"}</p>
          </section>

          <section className={"rounded-[13px] bg-surface p-6 text-card-foreground flex items-start gap-4"}>
            <span className="rounded-lg bg-danger-bg px-2.5 py-3 text-[11px] font-bold text-danger-fg">PDF</span>
            <div>
              <h3 className="text-lg font-semibold">Relatório de acompanhamento</h3>
              <p className="text-sm text-muted">{formatPeriod(report.periodStart, report.periodEnd)} · {reportPlatformLabels[report.platform]} · {formatFileSize(report.sizeBytes)}</p>
              <Link to={`/relatorios/${report.id}`} className="mt-1 inline-block text-sm font-semibold text-link">
                Ver documento →
              </Link>
            </div>
          </section>

          <div>
            <label className="flex cursor-pointer items-center gap-3 text-base font-semibold text-card-foreground">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="size-5 cursor-pointer accent-primary"
              />
              Confirmo paciente, período e documento anexado.
            </label>
            <p className="mt-3 text-sm text-muted">Envio registrado no histórico do paciente após confirmação.</p>
            {!approved && (
              <p role="status" className="mt-3 text-sm text-warning-fg">
                Aprove o relatório na revisão antes de preparar o envio.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 text-sm text-danger-fg">{error}</p>
            )}
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <Link
              to={`/relatorios/${report.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
            >
              Voltar à revisão
            </Link>

            <button
              type="button"
              disabled={!confirmed || !approved || sending}
              onClick={send}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
            >
              {sending ? "Enviando..." : "Enviar pelo WhatsApp"}
            </button>
          </div>

          <section className="rounded-xl bg-highlight p-5 text-card-foreground">
            <h3 className="font-semibold text-link">Privacidade e revisão</h3>
            <p className="mt-1 text-sm text-muted">
              O PDF só será enviado após confirmar a identidade do paciente e a correspondência do período.
            </p>
          </section>
        </div>

        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <h3 className="mb-5 text-xl font-semibold">WhatsApp · Prévia</h3>

          <div className="rounded-2xl bg-[#e6efe6] p-6 text-[#17384a]">
            <div className="rounded-2xl bg-[#dcf5d4] p-5">
              <p className="text-[15px] leading-6 whitespace-pre-line">{message}</p>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-brand-500">
                <FileText size={16} /> {report.originalName}
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted">Mensagem enviada como prévia · sem dados clínicos interpretados</p>
        </section>
      </div>
    </>
  );
}
export default function ReportSendPage() {
  const { id } = useParams();
  if (!id) return null;
  return <ReportSendView key={id} id={id} />;
}
