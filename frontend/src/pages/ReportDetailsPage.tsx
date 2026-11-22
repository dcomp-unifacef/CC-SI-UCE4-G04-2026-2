import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Minus, Plus } from "lucide-react";
import { reports } from "../data/reports";

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const report = reports.find((r) => r.id === Number(id));

  if (!report) {
    return (
      <p className="text-muted">
        Relatório não encontrado. <Link className="text-link" to="/relatorios">Voltar para a lista</Link>
      </p>
    );
  }

  const indicators = [
    { label: "Dias de uso", value: `${report.daysUsed} / ${report.daysTotal}` },
    { label: "Média diária", value: report.avgDaily },
    { label: "Adesão", value: `${report.adherence}%` },
    { label: "IAH / AHI", value: report.ahi },
    { label: "Vazamento", value: report.leak },
  ];

  function approve() {
    // TODO: aprovar o relatório na API
    navigate(`/relatorios/${report!.id}/enviar`);
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
          Relatório de acompanhamento
        </h2>
        <p className="text-sm leading-6 text-muted">
          {report.platform} · Período {report.range} · {report.status}
        </p>
      </header>

      <div className="mb-6 grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5 max-[1190px]:grid-cols-1">
        <section className="rounded-[13px] bg-surface p-6 text-card-foreground" aria-label="Documento">
          <div className="mb-4 flex items-center justify-between rounded-lg bg-background px-5 py-3">
            <span className="min-w-0 truncate text-base font-semibold">{report.fileName}</span>

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

          {/* TODO: trocar a folha abaixo por <iframe src={urlDoPdf} /> quando houver o arquivo real */}
          <div className="h-115 overflow-auto rounded-lg bg-background p-4">
            <div
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              className="mx-auto w-full max-w-105 bg-white p-8 text-[13px] leading-6 text-[#17384a]"
            >
              <p className="font-bold uppercase text-brand-700">Relatório de acompanhamento</p>
              <p className="mb-4 border-b border-[#e3ebf2] pb-3 text-xs text-[#71859f]">
                Sono Inteligente · {report.platform}
              </p>
              <p className="mb-3 text-base font-semibold">Resumo mensal de terapia</p>
              <p>Paciente: {report.patient}</p>
              <p className="mb-3">Período: {report.month} de 2026</p>
              <p>Dias de uso: {report.daysUsed} de {report.daysTotal}</p>
              <p>Média diária: {report.avgDaily}</p>
              <p>IAH médio: {report.ahi}</p>
              <p>Vazamento: {report.leak}</p>
            </div>
          </div>
        </section>

        <div className="grid content-start gap-5">
          <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
            <h3 className="mb-5 text-xl font-semibold">Indicadores extraídos</h3>
            <dl className="grid gap-4 text-sm">
              {indicators.map((item) => (
                <div key={item.label} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                  <dt className="text-muted">{item.label}</dt>
                  <dd className="font-semibold">{item.value}</dd>
                  <Check size={16} className="text-success-fg" aria-label="Conferido" />
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
            <h3 className="text-xl font-semibold">Histórico de adesão</h3>
            <p className="mb-6 text-sm text-muted">Evolução mensal · últimos 6 meses</p>

            <div
              role="img"
              aria-label={`Adesão nos últimos 6 meses: ${report.history.map((h) => `${h.month} ${h.value}%`).join(", ")}`}
              className="flex h-48 items-end justify-between gap-3"
            >
              {report.history.map((h) => (
                <div key={h.month} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                  <div style={{ height: `${h.value}%` }} className="rounded-t-md bg-brand-300" />
                  <span className="text-xs text-muted">{h.month}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-highlight p-6">
        <div>
          <h3 className="text-lg font-semibold text-link">Conferiu paciente, período e dados do PDF?</h3>
          <p className="text-sm text-muted">Aprovação libera a preparação do envio, não envia automaticamente.</p>
        </div>

        <button
          type="button"
          onClick={approve}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
        >
          Aprovar relatório
        </button>
      </div>
    </>
  );
}