import { useEffect, useRef, useState } from "react";
import { apiErrorMessage } from "../services/api";
import { fetchPatients, type Patient } from "../services/patients";

type Props = {
  onClose: () => void;
  onSelect: (patientId: string) => Promise<void>;
};

const SEARCH_DELAY = 400;

export default function AssociatePatientDialog({ onClose, onSelect }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searched, setSearched] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    const term = search.trim();
    const timer = setTimeout(() => {
      fetchPatients({
        page: 1,
        pageSize: 6,
        search: term,
        status: "ACTIVE",
        cpapModelId: "",
      })
        .then((result) => {
          setPatients(result.patients);
          setSearched(term);
        })
        .catch(() => setError("Não foi possível buscar os pacientes."));
    }, SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [search]);

  async function choose(patientId: string) {
    setSaving(true);
    setError("");
    try {
      await onSelect(patientId);
    } catch (err) {
      setError(apiErrorMessage(err, "Não foi possível associar o paciente."));
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[20px] bg-surface p-8 text-card-foreground backdrop:bg-[#17384a]"
    >
      <h2 className="text-2xl font-bold text-foreground">Associar paciente</h2>
      <p className="mt-2 text-sm text-muted">
        Busque o paciente a quem este relatório pertence.
      </p>

      <input
        type="search"
        aria-label="Buscar paciente"
        placeholder="Buscar por nome, CPF ou série do CPAP..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setError("");
        }}
        className="mt-5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-link"
      />

      <ul className="mt-4 grid gap-2">
        {patients.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              disabled={saving}
              onClick={() => choose(p.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg bg-background px-4 py-3 text-left hover:bg-highlight disabled:cursor-default disabled:opacity-60"
            >
              <span className="font-semibold">{p.fullName}</span>
              <span className="text-xs text-muted">
                {p.cpapModelName ?? "-"} · {p.cpapSerialNumber ?? "-"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {searched !== "" && patients.length === 0 && (
        <p role="status" className="mt-4 text-sm text-muted">
          Nenhum paciente encontrado.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger-fg">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm text-muted focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
        >
          Cancelar
        </button>
      </div>
    </dialog>
  );
}
