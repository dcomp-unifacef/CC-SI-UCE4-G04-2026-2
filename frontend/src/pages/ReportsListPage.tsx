import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Plus } from "lucide-react";
import { importQueue, importStats } from "../data/reports";
import type { ImportFile, ImportStatus } from "../data/reports";

const TAMANHO_MAX = 20 * 1024 * 1024;

const badge: Record<ImportStatus, { label: string; className: string }> = {
  linked: { label: "Associado", className: "bg-success-bg text-success-fg" },
  review: { label: "Revisar", className: "bg-warning-bg text-warning-fg" },
  processing: { label: "Processando", className: "bg-highlight text-link" },
  failed: { label: "Falhou", className: "bg-danger-bg text-danger-fg" },
};

export default function ReportsListPage() {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ImportFile[]>(importQueue);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function addFiles(list: FileList | null) {
    const selected = Array.from(list ?? []);
    const valid = selected.filter((f) => f.type === "application/pdf" && f.size <= TAMANHO_MAX);

    setError(
      valid.length < selected.length
        ? "Alguns arquivos foram ignorados: envie apenas PDFs de até 20 MB."
        : "",
    );
    if (valid.length === 0) return;

    // TODO: enviar `valid` para a API; o status real vem do processamento
    setFiles((prev) => [
      ...valid.map((f, i) => ({
        id: Date.now() + i,
        fileName: f.name,
        identification: "Aguardando leitura",
        status: "processing" as const,
      })),
      ...prev,
    ]);
  }

  function onSelect(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
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

        <button type="button" onClick={openPicker} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link">
          <Plus size={20} /> Importar PDF
        </button>
      </header>

      <div className="mb-6 grid grid-cols-4 gap-4 max-[1190px]:grid-cols-2 max-[800px]:gap-3">
        {importStats.map((stat) => (
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
          onClick={openPicker}
          className="cursor-pointer rounded-lg border border-border bg-secondary px-6 py-3 text-base font-semibold text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
        >
          Selecionar PDFs
        </button>
      </section>

      <h3 className="mb-3 text-2xl font-semibold text-foreground">
        Fila de importação · {files.length} {files.length === 1 ? "arquivo" : "arquivos"}
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
              {files.map((f) => (
                <tr key={f.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <span className="rounded-lg bg-danger-bg px-2.5 py-3 text-[11px] font-bold text-danger-fg">PDF</span>
                      <div className="min-w-0">
                        {f.reportId ? (
                          <Link
                            to={`/relatorios/${f.reportId}`}
                            className="block text-base font-semibold hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
                          >
                            {f.fileName}
                          </Link>
                        ) : (
                          <span className="block text-base font-semibold">{f.fileName}</span>
                        )}
                        <small className="text-xs text-muted">{f.identification}</small>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {f.status === "linked" && f.patient}
                    {f.status === "review" && <span className="text-warning-fg">Confirmar paciente</span>}
                    {f.status === "processing" && <span className="text-muted">Em processamento</span>}
                    {f.status === "failed" && <span className="text-danger-fg">Falha na leitura</span>}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-block min-w-28 rounded-full px-3 py-1.5 text-center ${badge[f.status].className}`}>
                      {badge[f.status].label}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {f.status === "review" && (
                      <button
                        type="button"
                        // TODO: abrir o fluxo de associação (não está no protótipo)
                        className="cursor-pointer font-semibold text-link"
                      >
                        Associar →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {files.length === 0 && (
          <p role="status" className="p-10 text-center text-muted">Nenhum arquivo na fila.</p>
        )}
      </section>
    </>
  );
}