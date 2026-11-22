import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Upload } from "lucide-react";
import Field from "../components/Field";
import { useForm } from "../hooks/useForm";
import { apiErrorMessage, apiInvalidFields } from "../services/api";
import {
  createPatient,
  deactivatePatient,
  fetchCpapModels,
  fetchPatient,
  updatePatient,
  uploadDocument,
  type CpapModel,
  type PatientDetails,
  type PatientPayload,
} from "../services/patients";
import { filterTypeLabels, reportPlatformLabels } from "../utils/labels";

const emptyForm: PatientPayload = {
  fullName: "",
  cpf: "",
  birthDate: "",
  phone: "",
  email: "",
  cep: "",
  therapyStartDate: "",
  cpapModelId: "",
  cpapSerialNumber: "",
  filterType: "",
  maskModel: "",
  reportPlatform: "",
  physicianName: "",
};

const fieldLabels: Record<string, string> = {
  fullName: "Nome completo",
  cpf: "CPF",
  birthDate: "Data de nascimento",
  phone: "Celular / WhatsApp",
  email: "E-mail",
  cep: "CEP",
  therapyStartDate: "Início do uso",
  cpapModelId: "Modelo CPAP",
  cpapSerialNumber: "Número de série",
  filterType: "Tipo de filtro",
  maskModel: "Máscara atual",
  reportPlatform: "Plataforma",
  physicianName: "Médico responsável",
};

const filterOptions = ["WASHABLE", "DISPOSABLE"].map((value) => ({
  value,
  label: filterTypeLabels[value],
}));
const platformOptions = ["AIRVIEW", "CARE_ORCHESTRATOR", "SMART_LIVE"].map(
  (value) => ({ value, label: reportPlatformLabels[value] }),
);
const masks = [
  "AirFit N20",
  "DreamWear",
  "AirFit F30i",
  "BMC N5A",
  "AirFit P10",
  "BMC F5",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function toForm(patient: PatientDetails): PatientPayload {
  return {
    fullName: patient.fullName,
    cpf: patient.cpf ?? "",
    birthDate: toDateInput(patient.birthDate),
    phone: patient.phone,
    email: patient.email ?? "",
    cep: patient.cep ?? "",
    therapyStartDate: toDateInput(patient.therapyStartDate),
    cpapModelId: patient.cpapModelId ?? "",
    cpapSerialNumber: patient.cpapSerialNumber ?? "",
    filterType: patient.filterType ?? "",
    maskModel: patient.maskModel ?? "",
    reportPlatform: patient.reportPlatform ?? "",
    physicianName: patient.physicianName ?? "",
  };
}

function saveErrorMessage(error: unknown) {
  const fields = apiInvalidFields(error)
    .map((field) => fieldLabels[field])
    .filter(Boolean);
  if (fields.length > 0) return `Verifique os campos: ${fields.join(", ")}.`;
  if (isAxiosError(error) && error.response?.status === 409) {
    return "Já existe um paciente cadastrado com este CPF.";
  }
  return apiErrorMessage(error, "Não foi possível salvar o paciente.");
}

function uploadErrorMessage(error: unknown) {
  if (isAxiosError(error) && error.response?.status === 409) {
    return "Este documento já foi enviado para este paciente.";
  }
  return apiErrorMessage(error, "Não foi possível enviar o PDF.");
}

type FormProps = {
  patientId?: string;
  patient?: PatientDetails;
};

function PatientForm({ patientId, patient }: FormProps) {
  const navigate = useNavigate();
  const [savedId, setSavedId] = useState<string | null>(null);
  const targetId = patientId ?? savedId;
  const isNew = patientId === undefined;

  const [models, setModels] = useState<CpapModel[]>([]);
  const [error, setError] = useState("");
  const { form, handleChange } = useForm(
    patient ? toForm(patient) : emptyForm,
    () => setError(""),
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    fetchCpapModels()
      .then(setModels)
      .catch(() => setModels([]));
  }, []);

  const modelOptions = models.map((m) => ({
    value: m.id,
    label: `${m.manufacturer} ${m.model}`,
  }));
  const maskOptions =
    form.maskModel && !masks.includes(form.maskModel)
      ? [...masks, form.maskModel]
      : masks;

  function chooseFile(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;

    if (selected && selected.size > MAX_FILE_SIZE) {
      e.target.value = "";
      setFile(null);
      setFileError("O arquivo excede 20 MB.");
      return;
    }

    setFileError("");
    setFile(selected);
  }

  async function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    let currentId = targetId;
    try {
      if (currentId) {
        await updatePatient(currentId, form);
      } else {
        const created = await createPatient(form);
        currentId = created.id;
        setSavedId(created.id);
      }
    } catch (err) {
      setError(saveErrorMessage(err));
      setSaving(false);
      return;
    }

    if (file) {
      try {
        await uploadDocument(currentId, file);
      } catch (err) {
        setError(
          `Paciente salvo, mas o PDF não foi enviado. ${uploadErrorMessage(err)}`,
        );
        setFile(null);
        setSaving(false);
        return;
      }
    }

    navigate(`/pacientes/${currentId}`);
  }

  async function deactivate() {
    if (!patientId) return;
    setDialogError("");
    try {
      await deactivatePatient(patientId);
      dialog.current?.close();
      navigate(`/pacientes/${patientId}`);
    } catch (err) {
      setDialogError(
        apiErrorMessage(err, "Não foi possível desativar o paciente."),
      );
    }
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
          {isNew ? "Novo paciente" : "Editar paciente"}
        </h2>
        <p className="text-sm leading-6 text-muted">
          {isNew
            ? "Cadastro do paciente e dados para início do acompanhamento."
            : "Atualize os dados do paciente e do acompanhamento."}
        </p>
      </header>

      <form onSubmit={save} className="grid gap-5">
        <section className="rounded-[13px] bg-surface p-6">
          <h3 className="mb-5 text-xl font-semibold text-card-foreground">
            Dados pessoais
          </h3>

          <div className="grid grid-cols-3 gap-x-6 gap-y-5 max-[800px]:grid-cols-1">
            <Field
              id="fullName"
              label="Nome completo"
              required
              placeholder="Preencher nome completo"
              value={form.fullName}
              onChange={handleChange}
            />

            <Field
              id="cpf"
              label="CPF"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={handleChange}
            />

            <Field
              id="birthDate"
              label="Data de Nascimento"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
            />

            <Field
              id="phone"
              label="Celular / WhatsApp"
              required
              type="tel"
              placeholder="(00) 00000-0000"
              value={form.phone}
              onChange={handleChange}
            />

            <Field
              id="email"
              label="E-mail"
              type="email"
              placeholder="Preencher e-mail"
              value={form.email}
              onChange={handleChange}
            />

            <Field
              id="cep"
              label="CEP"
              placeholder="00000-000"
              value={form.cep}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="rounded-[13px] bg-surface p-6">
          <h3 className="mb-5 text-xl font-semibold text-card-foreground">
            Tratamento e equipamento
          </h3>
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 max-[800px]:grid-cols-1">
            <Field
              id="therapyStartDate"
              label="Início do Uso"
              required
              type="date"
              value={form.therapyStartDate}
              onChange={handleChange}
            />

            <Field
              id="cpapModelId"
              label="Modelo CPAP"
              required={modelOptions.length > 0}
              options={modelOptions}
              value={form.cpapModelId}
              onChange={handleChange}
            />

            <Field
              id="cpapSerialNumber"
              label="Número de série"
              placeholder="Preencher número de série"
              value={form.cpapSerialNumber}
              onChange={handleChange}
            />

            <Field
              id="filterType"
              label="Tipo de Filtro"
              required
              options={filterOptions}
              value={form.filterType}
              onChange={handleChange}
            />

            <Field
              id="maskModel"
              label="Máscara Atual"
              options={maskOptions}
              value={form.maskModel}
              onChange={handleChange}
            />

            <Field
              id="reportPlatform"
              label="Plataforma"
              options={platformOptions}
              value={form.reportPlatform}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="rounded-[13px] bg-surface p-6">
          <h3 className="mb-5 text-xl font-semibold text-card-foreground">
            Médico e polissonografia
          </h3>
          <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
            <Field
              id="physicianName"
              label="Médico Responsável"
              placeholder="Nome do Médico"
              value={form.physicianName}
              onChange={handleChange}
            />

            <label className="grid cursor-pointer content-center gap-1 rounded-lg bg-background px-5 py-4 focus-within:outline-2 focus-within:outline-link">
              <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-link">
                <Upload size={18} />{" "}
                {file ? file.name : "Adicionar polissonografia (PDF)"}
              </span>

              <small
                className={`text-[11px] ${fileError ? "text-danger-fg" : "text-muted"}`}
              >
                {fileError || "PDF · máximo 20 MB"}
              </small>

              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={chooseFile}
              />
            </label>
          </div>
        </section>

        {error && (
          <p role="alert" className="text-sm text-danger-fg">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {patient && patient.status !== "INACTIVE" ? (
            <button
              type="button"
              onClick={() => dialog.current?.showModal()}
              className="cursor-pointer text-sm font-semibold text-danger-fg"
            >
              Desativar acompanhamento
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-3">
            <Link
              to={targetId ? `/pacientes/${targetId}` : "/pacientes"}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link disabled:cursor-default disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar paciente"}
            </button>
          </div>
        </div>
      </form>

      <dialog
        ref={dialog}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[20px] bg-surface p-8 text-card-foreground backdrop:bg-[#17384a]"
      >
        <span className="grid size-13 place-items-center rounded-full bg-warning-bg text-2xl font-bold text-warning-fg">
          !
        </span>

        <h2 className="mt-6 text-2xl font-bold text-foreground">
          Desativar acompanhamento?
        </h2>
        <p className="mt-3 text-[15px] leading-6 text-muted">
          {patient?.fullName} deixará de receber lembretes e não será incluída
          nas próximas automações de relatórios.
        </p>

        <div className="mt-6 rounded-lg bg-background px-5 py-4">
          <p className="block text-base font-semibold">
            O histórico e os documentos serão preservados.
          </p>
          <p className="text-sm text-muted">
            Você poderá reativar o acompanhamento depois.
          </p>
        </div>

        {dialogError && (
          <p role="alert" className="mt-4 text-sm text-danger-fg">
            {dialogError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm text-muted focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
          >
            Manter ativo
          </button>

          <button
            type="button"
            onClick={deactivate}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-[#b54747] px-5 py-2.5 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
          >
            Desativar paciente
          </button>
        </div>
      </dialog>
    </>
  );
}

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error" }
  | { status: "ready"; patient: PatientDetails };

function PatientFormLoader({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchPatient(id)
      .then((patient) => {
        if (!cancelled) setState({ status: "ready", patient });
      })
      .catch((err) => {
        if (cancelled) return;
        const notFound =
          isAxiosError(err) &&
          (err.response?.status === 404 || err.response?.status === 400);
        setState({ status: notFound ? "notFound" : "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") {
    return <p className="text-muted">Carregando...</p>;
  }

  if (state.status !== "ready") {
    return (
      <p className="text-muted">
        {state.status === "notFound"
          ? "Paciente não encontrado."
          : "Não foi possível carregar o paciente."}{" "}
        <Link className="text-link" to="/pacientes">
          Voltar para a lista
        </Link>
      </p>
    );
  }

  return <PatientForm patientId={id} patient={state.patient} />;
}

export default function PatientFormPage() {
  const { id } = useParams();
  if (!id) return <PatientForm />;
  return <PatientFormLoader key={id} id={id} />;
}
