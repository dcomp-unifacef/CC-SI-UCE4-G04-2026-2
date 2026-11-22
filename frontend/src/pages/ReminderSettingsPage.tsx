import { useCallback, useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { isAxiosError } from "axios";
import Field from "../components/Field";
import { useForm } from "../hooks/useForm";
import { apiErrorMessage } from "../services/api";
import { fetchCpapModels, type CpapModel, type FilterType } from "../services/patients";
import {
  createCpapModel,
  fetchSettings,
  updateSettings,
  type Settings,
} from "../services/settings";
import { filterTypeLabels } from "../utils/labels";

const timezones = [
  { value: "America/Noronha", label: "(UTC-02:00) Fernando de Noronha" },
  { value: "America/Sao_Paulo", label: "(UTC-03:00) Brasília" },
  { value: "America/Manaus", label: "(UTC-04:00) Manaus" },
  { value: "America/Rio_Branco", label: "(UTC-05:00) Rio Branco" },
];

const filterOptions = ["WASHABLE", "DISPOSABLE"].map((value) => ({
  value,
  label: filterTypeLabels[value],
}));

const reminderRulesByFilter: Record<FilterType, string> = {
  WASHABLE: "Higienização + troca 4 meses",
  DISPOSABLE: "Troca 60 dias",
  UNKNOWN: "Defina o tipo de filtro",
};

const reminderSummary = [
  { title: "Higienização filtro lavável", detail: "A cada 15 dias" },
  { title: "Troca filtro lavável", detail: "4 meses" },
  { title: "Troca filtro descartável", detail: "60 dias" },
  { title: "Lembretes anuais", detail: "Máscara, traqueia e limpeza preventiva" },
];

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; settings: Settings; models: CpapModel[] };

export default function ReminderSettingsPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(
    () =>
      Promise.all([fetchSettings(), fetchCpapModels()])
        .then(([settings, models]) => setState({ status: "ready", settings, models }))
        .catch(() => setState({ status: "error" })),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === "loading") {
    return <p className="text-muted">Carregando...</p>;
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="text-danger-fg">
        Não foi possível carregar as regras.{" "}
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
    );
  }

  return (
    <ReminderForm
      settings={state.settings}
      models={state.models}
      onModelAdded={load}
    />
  );
}

type FormProps = {
  settings: Settings;
  models: CpapModel[];
  onModelAdded: () => Promise<void>;
};

function ReminderForm({ settings, models, onModelAdded }: FormProps) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, handleChange } = useForm(
    {
      start: settings.sendingWindowStart,
      end: settings.sendingWindowEnd,
      timezone: settings.timezone,
    },
    () => {
      setSaved(false);
      setError("");
    },
  );

  const timezoneOptions = timezones.some((t) => t.value === form.timezone)
    ? timezones
    : [...timezones, { value: form.timezone, label: form.timezone }];

  async function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (form.start >= form.end) {
      setError("O horário final deve ser depois do inicial.");
      return;
    }

    setSaving(true);
    try {
      await updateSettings({
        sendingWindowStart: form.start,
        sendingWindowEnd: form.end,
        timezone: form.timezone,
      });
      setSaved(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Não foi possível salvar as regras."));
    }
    setSaving(false);
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

          <div className="grid grid-cols-[1fr_1fr] items-start gap-6 max-[1190px]:grid-cols-1">
            <fieldset>
              <legend className="mb-1 text-sm font-semibold text-card-foreground uppercase">
                Horário permitido
              </legend>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  name="start"
                  aria-label="Início"
                  required
                  value={form.start}
                  onChange={handleChange}
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-card-foreground focus-visible:outline-2 focus-visible:outline-link"
                />
                <span aria-hidden className="text-muted">a</span>
                <input
                  type="time"
                  name="end"
                  aria-label="Fim"
                  required
                  value={form.end}
                  onChange={handleChange}
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-card-foreground focus-visible:outline-2 focus-visible:outline-link"
                />
              </div>
            </fieldset>

            <Field id="timezone" label="Fuso horário" options={timezoneOptions} value={form.timezone} onChange={handleChange} className="mb-0" />
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
                    <td className="bg-background px-5 py-4 first:rounded-l-lg last:rounded-r-lg font-semibold">{m.manufacturer} · {m.model}</td>
                    <td className="bg-background px-5 py-4 first:rounded-l-lg last:rounded-r-lg text-muted">{filterTypeLabels[m.filterType]}</td>
                    <td className="bg-background px-5 py-4 first:rounded-l-lg last:rounded-r-lg text-muted">{reminderRulesByFilter[m.filterType]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {models.length === 0 && (
            <p role="status" className="py-6 text-center text-muted">Nenhum modelo cadastrado.</p>
          )}

          <p className="mt-4 text-sm text-warning-fg">
            Atenção: confirme o tipo de filtro de cada modelo com o fabricante antes de ativar.
          </p>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
          {error && <p role="alert" className="text-sm text-danger-fg">{error}</p>}
          {saved && <p role="status" className="text-sm text-success-fg">Regras salvas.</p>}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link disabled:cursor-default disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar regras"}
          </button>
        </div>
      </form>

      {adding && (
        <AddModelDialog
          onClose={() => setAdding(false)}
          onAdded={onModelAdded}
        />
      )}
    </>
  );
}

type DialogProps = {
  onAdded: () => Promise<void>;
  onClose: () => void;
};

function AddModelDialog({ onAdded, onClose }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { form, handleChange } = useForm(
    { manufacturer: "", model: "", filterType: "" },
    () => setError(""),
  );

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await createCpapModel({
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        filterType: form.filterType as FilterType,
      });
      await onAdded();
      onClose();
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 409
          ? "Este modelo já está cadastrado."
          : apiErrorMessage(err, "Não foi possível adicionar o modelo."),
      );
      setSaving(false);
    }
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
        <Field id="manufacturer" label="Fabricante" required placeholder="Ex.: ResMed" value={form.manufacturer} onChange={handleChange} />
        <Field id="model" label="Modelo" required placeholder="Ex.: AirSense 10" value={form.model} onChange={handleChange} />
        <Field id="filterType" label="Tipo de filtro" required options={filterOptions} value={form.filterType} onChange={handleChange} />

        {error && <p role="alert" className="mb-2 text-sm text-danger-fg">{error}</p>}

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="cursor-pointer px-4 text-sm text-muted">
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link disabled:cursor-default disabled:opacity-60"
          >
            {saving ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
