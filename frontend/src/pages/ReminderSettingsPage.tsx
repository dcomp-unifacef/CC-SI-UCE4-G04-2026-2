import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import Field from "../components/Field";
import { useForm } from "../hooks/useForm";
import {
  cpapModels as initialModels,
  filterTypes,
  ianaTimezones,
  reminderRulesByFilter,
  reminderSummary,
  weekdays,
} from "../data/settings";
import type { CpapModel, FilterType } from "../data/settings";

export default function ReminderSettingsPage() {
  const [days, setDays] = useState([1, 2, 3, 4, 5]);
  const [models, setModels] = useState(initialModels);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const { form, handleChange } = useForm(
    { start: "09:00", end: "18:00", timezone: "America/Sao_Paulo" },
    () => { setSaved(false); setError(""); },
  );

  function toggleDay(id: number) {
    setDays((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
    setSaved(false);
    setError("");
  }

  function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (days.length === 0) {
      setError("Selecione ao menos um dia autorizado.");
      return;
    }
    if (form.start >= form.end) {
      setError("O horário final deve ser depois do inicial.");
      return;
    }

    // TODO: enviar `days`, `form` e `models` para a API
    console.log("salvar regras", { days, ...form, models });
    setSaved(true);
  }

  return (
    <>
      <form onSubmit={save}>
        <header className="mb-6">
          <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">Regras de lembrete</h2>
          <p className="text-sm leading-6 text-muted">Periodicidade, horário de envio e mapeamento de filtros.</p>
        </header>

        <section className="rounded-[13px] bg-surface p-6 text-card-foreground mb-5">
          <h3 className="mb-5 text-xl font-semibold">Janela de envio</h3>

          <div className="grid grid-cols-[1.4fr_1fr_1fr] items-start gap-6 max-[1190px]:grid-cols-1">
            <fieldset>
              <legend className="mb-1 text-sm font-semibold text-card-foreground uppercase">
                Dias autorizados
              </legend>
              <div className="flex flex-wrap gap-2">
                {weekdays.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={days.includes(id)}
                    onClick={() => toggleDay(id)}
                    className="min-w-12 cursor-pointer rounded-lg bg-background px-3 py-2.5 text-sm text-muted focus-visible:outline-2 focus-visible:outline-link aria-pressed:bg-highlight aria-pressed:font-semibold aria-pressed:text-link"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1 text-sm font-semibold text-card-foreground uppercase">
                Horário permitido
              </legend>
              <div className="flex items-center gap-3">
                <input
                    type="time"
                    name="start"
                    aria-label="Início"
                    required value={form.start}
                    onChange={handleChange}
                    className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-card-foreground focus-visible:outline-2 focus-visible:outline-link"
                />
                <span aria-hidden className="text-muted">—</span>
                <input
                    type="time"
                    name="end"
                    aria-label="Fim"
                    required value={form.end}
                    onChange={handleChange}
                    className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-card-foreground focus-visible:outline-2 focus-visible:outline-link"
                />
              </div>
            </fieldset>

            <Field id="timezone" label="Fuso horário" options={ianaTimezones} value={form.timezone} onChange={handleChange} className="mb-0" />
          </div>

          <dl className="mt-6 grid grid-cols-4 gap-6 border-t border-border pt-6 max-[1190px]:grid-cols-2 max-[800px]:grid-cols-1">
            {reminderSummary.map((rule) => (
              <div key={rule.title}>
                <dt className="font-semibold">{rule.title}</dt>
                <dd className="text-sm text-muted">{rule.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Modelos CPAP e tipo de filtro</h3>
              <p className="text-sm text-muted">O mapeamento define quais lembretes são compatíveis.</p>
            </div>

            <button type="button" onClick={() => setAdding(true)} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link">
              + Adicionar modelo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-xl border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-[11px] text-muted">
                <tr>
                  <th className="px-5 py-2 font-semibold">FABRICANTE / MODELO</th>
                  <th className="px-5 py-2 font-semibold">TIPO DE FILTRO</th>
                  <th className="px-5 py-2 font-semibold">LEMBRETES APLICÁVEIS</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id}>
                    <td className="bg-background px-5 py-4 first:rounded-l-lg last:rounded-r-lg font-semibold">{m.maker} · {m.model}</td>
                    <td className="bg-background px-5 py-4 first:rounded-l-lg last:rounded-r-lg text-muted">{m.filter}</td>
                    <td className="bg-background px-5 py-4 first:rounded-l-lg last:rounded-r-lg text-muted">{reminderRulesByFilter[m.filter]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-warning-fg">
            Atenção: confirme o tipo de filtro de cada modelo com o fabricante antes de ativar.
          </p>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
          {error && <p role="alert" className="text-sm text-danger-fg">{error}</p>}
          {saved && <p role="status" className="text-sm text-success-fg">Regras salvas.</p>}
          <button type="submit" className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link">
            Salvar regras
          </button>
        </div>
      </form>

      {/* Fora do <form>: formulários não podem ficar aninhados */}
      {adding && (
        <AddModelDialog
          onClose={() => setAdding(false)}
          onAdd={(model) => {
            setModels((prev) => [...prev, { ...model, id: Date.now() }]);
            setSaved(false);
          }}
        />
      )}
    </>
  );
}

// Só é montado enquanto está aberto, então os campos sempre começam vazios
function AddModelDialog({ onAdd, onClose }: { onAdd: (model: Omit<CpapModel, "id">) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { form, handleChange } = useForm({ maker: "", model: "", filter: "" });

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    onAdd({ maker: form.maker.trim(), model: form.model.trim(), filter: form.filter as FilterType });
    onClose();
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(520px,calc(100vw-32px))] rounded-[20px] bg-surface p-8 text-card-foreground backdrop:bg-[#17384a]"
    >
      <h2 className="text-2xl font-bold text-foreground">Adicionar modelo</h2>
      <p className="mt-2 mb-6 text-sm text-muted">Informe o fabricante, o modelo e o tipo de filtro do CPAP.</p>

      <form onSubmit={submit} className="grid">
        <Field id="maker" label="Fabricante" required placeholder="Ex.: ResMed" value={form.maker} onChange={handleChange} />
        <Field id="model" label="Modelo" required placeholder="Ex.: AirSense 10" value={form.model} onChange={handleChange} />
        <Field id="filter" label="Tipo de filtro" required options={filterTypes} value={form.filter} onChange={handleChange} />

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="cursor-pointer px-4 text-sm text-muted">
            Cancelar
          </button>

          <button type="submit" className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link">
            Adicionar
          </button>
        </div>
      </form>
    </dialog>
  );
}