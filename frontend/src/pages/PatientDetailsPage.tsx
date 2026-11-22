import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "../services/api";
import {
  fetchPatient,
  openDocument,
  type PatientDetails,
} from "../services/patients";
import {
  auditActionLabels,
  auditEntityLabels,
  badgeClasses,
  filterTypeLabels,
  formatDate,
  formatRelativeDate,
  messageCategoryLabels,
  patientStatusLabels,
} from "../utils/labels";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error" }
  | { status: "ready"; patient: PatientDetails };

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

const tabs = [
  "Visão geral",
  "Mensagens",
  "Relatórios",
  "Documentos",
  "Alterações",
];

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
      <h3 className="mb-5 text-xl font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Data({ title, value }: { title: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted">{title}</dt>
      <dd className="mt-1 text-sm font-semibold">{value || "-"}</dd>
    </div>
  );
}

function PatientDetailsView({ id }: { id: string }) {
  const [tab, setTab] = useState(tabs[0]);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [documentError, setDocumentError] = useState("");

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

  const { patient } = state;
  const [statusLabel, statusColor] = patientStatusLabels[patient.status];
  const activities = patient.auditEvents.slice(0, 5);
  const nextReminder = patient.messages
    .filter((m) => m.status === "SCHEDULED" && m.scheduledAt)
    .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!))[0];
  const latestDocument = patient.documents[0];

  async function viewDocument() {
    if (!latestDocument) return;
    setDocumentError("");
    try {
      await openDocument(patient.id, latestDocument.id);
    } catch (err) {
      setDocumentError(
        apiErrorMessage(err, "Não foi possível abrir o documento."),
      );
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6 max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-2">
        <div>
          <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
            {patient.fullName}
          </h2>

          <p className="mb-7 text-sm leading-5 text-muted">
            Paciente desde {formatDate(patient.therapyStartDate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm ${badgeClasses[statusColor]}`}
          >
            {statusLabel}
          </span>
          <Link
            to={`/pacientes/${patient.id}/editar`}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link"
          >
            Editar dados
          </Link>
        </div>
      </div>

      <div
        role="tablist"
        className="mb-5 flex gap-8 overflow-x-auto rounded-xl bg-surface px-9"
      >
        {tabs.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`cursor-pointer py-5 text-base whitespace-nowrap ${
              tab === name ? "font-semibold text-foreground" : "text-muted"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {tab !== "Visão geral" ? (
        <p className="rounded-[13px] bg-surface p-10 text-center text-muted">
          Em breve.
        </p>
      ) : (
        <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] gap-5 max-[1190px]:grid-cols-1">
          <div className="grid content-start gap-5">
            <Card title="Dados pessoais">
              <dl className="grid grid-cols-3 gap-x-6 gap-y-8 max-[800px]:grid-cols-1">
                <Data title="Nome Completo" value={patient.fullName} />

                <Data title="Celular / WhatsApp" value={patient.phone} />

                <Data
                  title="Data de Nascimento"
                  value={patient.birthDate ? formatDate(patient.birthDate) : null}
                />

                <Data
                  title="Idade"
                  value={patient.age === null ? null : `${patient.age} anos`}
                />

                <Data title="E-mail" value={patient.email} />

                <Data title="Médico responsável" value={patient.physicianName} />
              </dl>
            </Card>

            <Card title="Atividade recente">
              {activities.length === 0 ? (
                <p className="text-sm text-muted">
                  Nenhuma atividade registrada.
                </p>
              ) : (
                <ul>
                  {activities.map((a, i) => (
                    <li key={a.id} className="flex items-start gap-3.5 py-3">
                      <span
                        className={`mt-2 size-3 shrink-0 rounded-full ${i === 0 ? "bg-success-fg" : "bg-brand-300"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-semibold">
                          {auditActionLabels[a.action] ?? a.action}
                        </h4>
                        <p className="text-sm text-muted">
                          {auditEntityLabels[a.entityType]?.[0] ?? a.entityType}
                        </p>
                      </div>
                      <time className="text-sm whitespace-nowrap text-muted">
                        {formatRelativeDate(a.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="grid content-start gap-5">
            <Card title="Equipamento atual">
              <dl className="grid gap-5">
                <Data title="CPAP" value={patient.cpapModelName} />

                <Data title="Número de série" value={patient.cpapSerialNumber} />

                <Data
                  title="Máscara · Filtro"
                  value={`${patient.maskModel ?? "-"} · ${patient.filterType ? filterTypeLabels[patient.filterType] : "-"}`}
                />
              </dl>
            </Card>

            <Card title="Próximo lembrete">
              {nextReminder ? (
                <>
                  <p className="text-base text-muted">
                    {messageCategoryLabels[nextReminder.category] ??
                      nextReminder.category}
                  </p>
                  <p className="mt-2 text-base font-semibold text-link">
                    {formatRelativeDate(nextReminder.scheduledAt!)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">Nenhum lembrete agendado.</p>
              )}
            </Card>

            <Card title="Documentos">
              {latestDocument ? (
                <>
                  <p className="text-base font-semibold text-link">
                    {latestDocument.originalName}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    PDF · {formatSize(latestDocument.sizeBytes)} ·{" "}
                    {formatDate(latestDocument.createdAt)}
                  </p>
                  {documentError && (
                    <p role="alert" className="mt-2 text-sm text-danger-fg">
                      {documentError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={viewDocument}
                    className="mt-6 cursor-pointer text-sm font-semibold text-link"
                  >
                    Ver documento →
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted">
                  Nenhum documento enviado.
                </p>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

export default function PatientDetailsPage() {
  const { id } = useParams();
  if (!id) return null;
  return <PatientDetailsView key={id} id={id} />;
}
