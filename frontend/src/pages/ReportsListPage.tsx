import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Plus } from "lucide-react";
import Field from "../components/Field";
import { apiErrorMessage } from "../services/api";
import {
  fetchReports,
  importReports,
  type ImportOptions,
  type Report,
} from "../services/reports";
import { formatPeriod, reportPlatformLabels } from "../utils/labels";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

type QueueStatus = "linked" | "review" | "processing" | "failed";

const badge: Record<QueueStatus, { label: string; className: string }> = {
  linked: { label: "Associado", className: "bg-success-bg text-success-fg" },
  review: { label: "Revisar", className: "bg-warning-bg text-warning-fg" },
  processing: { label: "Processando", className: "bg-highlight text-link" },
  failed: { label: "Falhou", className: "bg-danger-bg text-danger-fg" },
};

const platformOptions = ["AIRVIEW", "CARE_ORCHESTRATOR", "SMART_LIVE", "MANUAL"].map(
  (value) => ({ value, label: reportPlatformLabels[value] }),
);

function queueStatus(report: Report): QueueStatus {
  if (report.status === "FAILED") return "failed";
  if (report.status === "PROCESSING") return "processing";
  if (report.status === "AWAITING_MATCH") return "review";
  return "linked";
}

function identification(report: Report) {
  return [
    reportPlatformLabels[report.platform],
    report.matchIdentifier ? `ID ${report.matchIdentifier}` : null,
    report.periodStart ? formatPeriod(report.periodStart, report.periodEnd) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; reports: Report[] };

export default function ReportsListPage() {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [options, setOptions] = useState<ImportOptions>({
    platform: "",
    periodStart: "",
    periodEnd: "",
  });
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      fetchReports({ pageSize: 100 })
        .then((reports) => setState({ status: "ready", reports }))
        .catch(() => setState({ status: "error" })),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const reports = state.status === "ready" ? state.reports : [];
  const count = (...statuses: string[]) =>
    reports.filter((r) => statuses.includes(r.status)).length;
  const stats = [
    { label: "Pendentes", value: count("AWAITING_MATCH", "PROCESSING") },
    { label: "Em revisão", value: count("REVIEW_REQUIRED") },
    { label: "Processados", value: count("APPROVED", "SENT") },
    { label: "Com falha", value: count("FAILED") },
  ];

  function changeOption(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setOptions((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function addFiles(list: FileList | null) {
    const selected = Array.from(list ?? []);
    const valid = selected.filter((f) => f.type === "application/pdf" && f.size <= MAX_FILE_SIZE);

    if (selected.length === 0) return;

    if (!options.periodStart || !options.periodEnd) {
      setError("Informe o período do relatório antes de importar.");
      return;
    }
    if (options.periodEnd < options.periodStart) {
      setError("A data final do período deve ser igual ou posterior à inicial.");
      return;
    }
    if (valid.length === 0) {
      setError("Envie apenas PDFs de até 20 MB.");
      return;
    }

    setImporting(true);
    const notes: string[] = [];
    if (valid.length < selected.length) {
      notes.push("Alguns arquivos foram ignorados: envie apenas PDFs de até 20 MB.");
    }
    try {
      const results = await importReports(valid, options);
      const duplicates = results.filter((r) => r.status === "DUPLICATE").length;
      const failed = results.filter((r) => r.status === "FAILED").length;
      if (duplicates > 0) {
        notes.push(
          `${duplicates} ${duplicates === 1 ? "arquivo já tinha sido importado" : "arquivos já tinham sido importados"}.`,
        );
      }
      if (failed > 0) {
        notes.push(
          `${failed} ${failed === 1 ? "arquivo não pôde ser importado" : "arquivos não puderam ser importados"}.`,
        );
      }
      await load();
    } catch (err) {
      notes.push(apiErrorMessage(err, "Não foi possível importar os arquivos."));
    }
    setError(notes.join(" "));
    setImporting(false);
  }

  function onSelect(e: ChangeEvent<HTMLInputElement>) {
    void addFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    setDragging(false);
    void addFiles(e.dataTransfer.files);
  }

  const openPicker = () => input.current?.click();

  return (
    <>
      <input ref={input} type="file" accept="application/pdf" multiple className="sr-only" tabIndex={-1} onChange={onSelect} />

      <header className="mb-6 flex flex-wrap items-start justify-between gap-x-5 gap-y-3.5">
        <div>
          <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">Relatórios</h2>
          <p className="text-sm leading-6 text-muted">Importe, revise e acompanhe os relatórios dos pacientes.</p>
        </div>

        <button type="button" disabled={importing} onClick={openPicker} className="inline-flex disabled:cursor-default disabled:opacity-60 min-h-11 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link">
          <Plus size={20} /> {importing ? "Importando..." : "Importar PDF"}
        </button>
      </header>

      <div className="mb-6 grid grid-cols-4 gap-4 max-[1190px]:grid-cols-2 max-[800px]:gap-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-xl bg-surface p-6 text-card-foreground">
            <h3 className="text-sm text-muted">{stat.label}</h3>
            <strong className="mt-2 block text-[32px] leading-10 text-foreground">
              {String(stat.value).padStart(2, "0")}
            </strong>
          </article>
        ))}
      </div>

      <section
        aria-label="Importar relatórios"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mb-10 flex flex-wrap items-center gap-6 rounded-[13px] bg-surface p-8 text-card-foreground ${
          dragging ? "ring-2 ring-link" : ""
        }`}
      >
        <span className="grid size-18 shrink-0 place-items-center rounded-full bg-highlight text-link">
          <ArrowUp size={30} />
        </span>

        <div className="min-w-60 flex-1">
          <h3 className="text-2xl font-semibold">Importar vários relatórios</h3>
          <p className="text-base text-muted">Arraste PDFs aqui ou selecione arquivos do computador</p>
          <p className="mt-2 text-sm text-link">
            Associação automática por identificador confiável · itens ambíguos ficam para confirmação
          </p>
          {error && <p role="alert" className="mt-2 text-sm text-danger-fg">{error}</p>}
        </div>

        <button
          type="button"
          disabled={importing}
          onClick={openPicker}
          className="cursor-pointer rounded-lg disabled:cursor-default disabled:opacity-60 border border-border bg-secondary px-6 py-3 text-base font-semibold text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
        >
          {importing ? "Importando..." : "Selecionar PDFs"}
        </button>

        <div className="grid w-full grid-cols-3 gap-x-6 max-[800px]:grid-cols-1">
          <Field
            id="platform"
            label="Plataforma"
            options={platformOptions}
            value={options.platform}
            onChange={changeOption}
            className="mb-0"
          />
          <Field
            id="periodStart"
            label="Início do período"
            type="date"
            value={options.periodStart}
            onChange={changeOption}
            className="mb-0"
          />
          <Field
            id="periodEnd"
            label="Fim do período"
            type="date"
            value={options.periodEnd}
            onChange={changeOption}
            className="mb-0"
          />
        </div>
      </section>

      <h3 className="mb-3 text-2xl font-semibold text-foreground">
        Fila de importação · {reports.length} {reports.length === 1 ? "arquivo" : "arquivos"}
      </h3>

      <section aria-label="Fila de importação" className="overflow-hidden rounded-xl bg-surface text-card-foreground px-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 border-collapse text-left text-sm">
            <thead className="text-[11px] text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">ARQUIVO / IDENTIFICAÇÃO</th>
                <th className="px-4 py-3 font-semibold">PACIENTE</th>
                <th className="px-4 py-3 font-semibold">STATUS</th>
                <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => {
                const status = queueStatus(r);
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <span className="rounded-lg bg-danger-bg px-2.5 py-3 text-[11px] font-bold text-danger-fg">PDF</span>
                        <div className="min-w-0">
                          <Link
                            to={`/relatorios/${r.id}`}
                            className="block text-base font-semibold hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
                          >
                            {r.originalName}
                          </Link>
                          <small className="text-xs text-muted">{identification(r)}</small>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {status === "linked" && r.patient?.fullName}
                      {status === "review" && <span className="text-warning-fg">Confirmar paciente</span>}
                      {status === "processing" && <span className="text-muted">Em processamento</span>}
                      {status === "failed" && <span className="text-danger-fg">Falha na leitura</span>}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-block min-w-28 rounded-full px-3 py-1.5 text-center ${badge[status].className}`}>
                        {badge[status].label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {status === "review" && (
                        <Link
                          to={`/relatorios/${r.id}`}
                          className="font-semibold text-link"
                        >
                          Associar →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {state.status === "loading" && (
          <p role="status" className="p-10 text-center text-muted">Carregando relatórios...</p>
        )}

        {state.status === "error" && (
          <p role="alert" className="p-10 text-center text-danger-fg">
            Não foi possível carregar os relatórios.{" "}
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

        {state.status === "ready" && reports.length === 0 && (
          <p role="status" className="p-10 text-center text-muted">Nenhum arquivo na fila.</p>
        )}
      </section>
    </>
  );
}