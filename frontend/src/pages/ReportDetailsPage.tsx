import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Minus, Plus } from "lucide-react";
import AssociatePatientDialog from "../components/AssociatePatientDialog";
import Field from "../components/Field";
import { apiErrorMessage } from "../services/api";
import {
  approveReport,
  associateReport,
  fetchReport,
  fetchReportFile,
  fetchReports,
  metricNumber,
  metricText,
  saveMetrics,
  type MetricsInput,
  type Report,
} from "../services/reports";
import {
  daysInPeriod,
  formatMonthShort,
  formatPeriod,
  reportPlatformLabels,
  reportStatusLabels,
} from "../utils/labels";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error" }
  | { status: "ready"; report: Report };

type HistoryPoint = { month: string; value: number };

function formatNumber(value: number) {
  return String(value).replace(".", ",");
}

function toMetricsInput(report: Report): MetricsInput {
  const read = (key: string) => {
    const value = metricNumber(report, key);
    return value === null ? "" : formatNumber(value);
  };
  return {
    daysUsed: read("days_used"),
    averageDailyUsage: metricText(report, "average_daily_usage") ?? "",
    adherence: read("adherence"),
    ahi: read("ahi"),
    leak: read("leak"),
  };
}

function buildHistory(reports: Report[]): HistoryPoint[] {
  return reports
    .filter((r) => r.periodStart && metricNumber(r, "adherence") !== null)
    .sort((a, b) => a.periodStart!.localeCompare(b.periodStart!))
    .slice(-6)
    .map((r) => ({
      month: formatMonthShort(r.periodStart!),
      value: metricNumber(r, "adherence")!,
    }));
}

function ReportDetailsView({ id }: { id: string }) {
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [zoom, setZoom] = useState(100);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFailed, setPdfFailed] = useState(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [editing, setEditing] = useState(false);
  const [metricsForm, setMetricsForm] = useState<MetricsInput | null>(null);
  const [metricsError, setMetricsError] = useState("");
  const [savingMetrics, setSavingMetrics] = useState(false);
  const [associating, setAssociating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState("");

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

  useEffect(() => {
    let cancelled = false;
    let url = "";
    fetchReportFile(id)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPdfFailed(true);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  const patientId = state.status === "ready" ? state.report.patientId : null;
  const metricsKey =
    state.status === "ready" ? JSON.stringify(state.report.metrics) : "";

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    fetchReports({ patientId, pageSize: 24 })
      .then((reports) => {
        if (!cancelled) setHistory(buildHistory(reports));
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId, metricsKey]);

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
  const [statusLabel] = reportStatusLabels[report.status];
  const totalDays = daysInPeriod(report.periodStart, report.periodEnd);
  const daysUsed = metricNumber(report, "days_used");
  const average = metricText(report, "average_daily_usage");
  const adherence = metricNumber(report, "adherence");
  const ahi = metricNumber(report, "ahi");
  const leak = metricNumber(report, "leak");

  const indicators = [
    {
      label: "Dias de uso",
      value: daysUsed === null ? null : `${formatNumber(daysUsed)} / ${totalDays ?? "-"}`,
    },
    { label: "Média diária", value: average },
    { label: "Adesão", value: adherence === null ? null : `${formatNumber(adherence)}%` },
    { label: "IAH / AHI", value: ahi === null ? null : `${formatNumber(ahi)} eventos/h` },
    { label: "Vazamento", value: leak === null ? null : `${formatNumber(leak)} L/min` },
  ];

  function startEditing() {
    setMetricsForm(toMetricsInput(report));
    setMetricsError("");
    setEditing(true);
  }

  function changeMetric(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setMetricsForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    setMetricsError("");
  }

  async function submitMetrics(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!metricsForm) return;
    setSavingMetrics(true);
    setMetricsError("");
    try {
      await saveMetrics(report.id, metricsForm);
      await load();
      setEditing(false);
    } catch (err) {
      setMetricsError(
        err instanceof Error && err.message === "invalid-number"
          ? "Use apenas números nos indicadores."
          : apiErrorMessage(err, "Não foi possível salvar os indicadores."),
      );
    }
    setSavingMetrics(false);
  }

  async function associate(selectedId: string) {
    await associateReport(report.id, selectedId);
    setAssociating(false);
    await load();
  }

  async function approve() {
    setApproving(true);
    setApproveError("");
    try {
      await approveReport(report.id);
      navigate(`/relatorios/${report.id}/enviar`);
    } catch (err) {
      setApproveError(
        isAxiosError(err) && err.response?.status === 409
          ? "Não foi possível aprovar. O relatório precisa ter paciente associado, período informado e estar em revisão."
          : apiErrorMessage(err, "Não foi possível aprovar o relatório."),
      );
      setApproving(false);
    }
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
          Relatório de acompanhamento
        </h2>
        <p className="text-sm leading-6 text-muted">
          {report.patient?.fullName ?? "Paciente não associado"} · {reportPlatformLabels[report.platform]} · Período {formatPeriod(report.periodStart, report.periodEnd)} · {statusLabel}
        </p>
      </header>

      {!report.patientId && (
        <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-warning-bg p-5 text-warning-fg">
          <p className="text-sm font-semibold">
            Este relatório ainda não está associado a um paciente.
          </p>
          <button
            type="button"
            onClick={() => setAssociating(true)}
            className="cursor-pointer text-sm font-semibold underline"
          >
            Associar paciente
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5 max-[1190px]:grid-cols-1">
        <section className="rounded-[13px] bg-surface p-6 text-card-foreground" aria-label="Documento">
          <div className="mb-4 flex items-center justify-between rounded-lg bg-background px-5 py-3">
            <span className="min-w-0 truncate text-base font-semibold">{report.originalName}</span>

            <div className="flex items-center gap-2 text-sm text-muted">
              <button type="button" aria-label="Diminuir zoom" disabled={zoom <= 50} onClick={() => setZoom(zoom - 10)} className="grid size-7 cursor-pointer place-items-center rounded text-muted hover:bg-highlight focus-visible:outline-2 focus-visible:outline-link">
                <Minus size={14} />
              </button>
              <span className="w-12 text-center">{zoom}%</span>
              <button type="button" aria-label="Aumentar zoom" disabled={zoom >= 200} onClick={() => setZoom(zoom + 10)} className="grid size-7 cursor-pointer place-items-center rounded text-muted hover:bg-highlight focus-visible:outline-2 focus-visible:outline-link">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="h-115 overflow-auto rounded-lg bg-background p-4">
            {pdfUrl && (
              <iframe
                title="Documento do relatório"
                src={pdfUrl}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                className="mx-auto h-full w-full rounded bg-white"
              />
            )}
            {!pdfUrl && !pdfFailed && (
              <p role="status" className="p-6 text-center text-muted">Carregando documento...</p>
            )}
            {pdfFailed && (
              <p role="alert" className="p-6 text-center text-danger-fg">Não foi possível carregar o documento.</p>
            )}
          </div>
        </section>

        <div className="grid content-start gap-5">
          <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Indicadores extraídos</h3>
              {report.status !== "SENT" && !editing && (
                <button type="button" onClick={startEditing} className="cursor-pointer text-sm font-semibold text-link">
                  Editar
                </button>
              )}
            </div>

            {editing && metricsForm ? (
              <form onSubmit={submitMetrics}>
                <Field id="daysUsed" label="Dias de uso" inputMode="decimal" value={metricsForm.daysUsed} onChange={changeMetric} className="mb-3" />
                <Field id="averageDailyUsage" label="Média diária" placeholder="6h42" value={metricsForm.averageDailyUsage} onChange={changeMetric} className="mb-3" />
                <Field id="adherence" label="Adesão (%)" inputMode="decimal" value={metricsForm.adherence} onChange={changeMetric} className="mb-3" />
                <Field id="ahi" label="IAH / AHI (eventos/h)" inputMode="decimal" value={metricsForm.ahi} onChange={changeMetric} className="mb-3" />
                <Field id="leak" label="Vazamento (L/min)" inputMode="decimal" value={metricsForm.leak} onChange={changeMetric} className="mb-3" />

                {metricsError && (
                  <p role="alert" className="mb-3 text-sm text-danger-fg">{metricsError}</p>
                )}

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setEditing(false)} className="cursor-pointer text-sm text-muted">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingMetrics}
                    className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-sm text-primary-foreground disabled:cursor-default disabled:opacity-60"
                  >
                    {savingMetrics ? "Salvando..." : "Salvar indicadores"}
                  </button>
                </div>
              </form>
            ) : (
              <dl className="grid gap-4 text-sm">
                {indicators.map((item) => (
                  <div key={item.label} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                    <dt className="text-muted">{item.label}</dt>
                    <dd className="font-semibold">{item.value ?? "-"}</dd>
                    {item.value ? (
                      <Check size={16} className="text-success-fg" aria-label="Preenchido" />
                    ) : (
                      <span className="size-4" />
                    )}
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
            <h3 className="text-xl font-semibold">Histórico de adesão</h3>
            <p className="mb-6 text-sm text-muted">Evolução mensal · últimos 6 meses</p>

            {history.length === 0 ? (
              <p className="text-sm text-muted">Ainda não há indicadores de adesão para montar o histórico.</p>
            ) : (
              <div
                role="img"
                aria-label={`Adesão nos últimos meses: ${history.map((h) => `${h.month} ${formatNumber(h.value)}%`).join(", ")}`}
                className="flex h-48 items-end justify-between gap-3"
              >
                {history.map((h, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                    <div style={{ height: `${Math.min(100, h.value)}%` }} className="rounded-t-md bg-brand-300" />
                    <span className="text-xs text-muted">{h.month}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-highlight p-6">
        <div>
          <h3 className="text-lg font-semibold text-link">Conferiu paciente, período e dados do PDF?</h3>
          <p className="text-sm text-muted">Aprovação libera a preparação do envio, não envia automaticamente.</p>
          {approveError && (
            <p role="alert" className="mt-2 text-sm text-danger-fg">{approveError}</p>
          )}
        </div>

        {report.status === "APPROVED" && (
          <Link
            to={`/relatorios/${report.id}/enviar`}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
          >
            Preparar envio
          </Link>
        )}

        {report.status !== "APPROVED" && report.status !== "SENT" && (
          <button
            type="button"
            onClick={approve}
            disabled={approving}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:cursor-default disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
          >
            {approving ? "Aprovando..." : "Aprovar relatório"}
          </button>
        )}
      </div>

      {associating && (
        <AssociatePatientDialog
          onClose={() => setAssociating(false)}
          onSelect={associate}
        />
      )}
    </>
  );
}

export default function ReportDetailsPage() {
  const { id } = useParams();
  if (!id) return null;
  return <ReportDetailsView key={id} id={id} />;
}
