import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { listaPacientes } from "../data/listaPacientes";
import type { Patient } from "../hooks/usePatients";

// Campos que ainda não existem em listaPacientes
type PatientDetails = Patient &
  Partial<{
    celular: string;
    email: string;
    nascimento: string;
    filtro: string;
    desde: string
  }>;

// Dados de exemplo (trocar pela API depois)
const atividades = [
  {
    titulo: "Mensagem enviada",
    detalhe: "Higienização do filtro",
    data: "Hoje · 09:42",
  },
  {
    titulo: "Relatório processado",
    detalhe: "AirView · Setembro 2026",
    data: "20 out · 14:08",
  },
  {
    titulo: "Dados atualizados",
    detalhe: "Número de série confirmado",
    data: "15 out · 11:20",
  },
  {
    titulo: "Mensagem enviada",
    detalhe: "Troca de filtro",
    data: "12 out · 09:30",
  },
];
const lembrete = {
  nome: "Higienização do filtro",
  quando: "em 8 dias · 4 nov 2026",
};
const documento = {
  nome: "Polissonografia.pdf",
  info: "PDF · 2,4 MB · 12 mar 2024",
};

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

function Data({ title, value }: { title: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{title}</dt>
      <dd className="mt-1 text-sm font-semibold">{value ?? "—"}</dd>
    </div>
  );
}

export default function PatientDetailsPage() {
  const { id } = useParams();
  const [tab, setTab] = useState(tabs[0]);
  const patient = listaPacientes.find((p) => p.id === Number(id)) as PatientDetails | undefined;

  if (!patient) {
    return (
      <p className="text-muted">
        Paciente não encontrado.{" "}
        <Link className="text-link" to="/pacientes">
          Voltar para a lista
        </Link>
      </p>
    );
  }

  const active = patient.status !== "Pausado";

  return (
    <>
        <div className="flex justify-between items-center mb-6 max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-2">
            <div>
                <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
                    {patient.nome}
                </h2>

                <p className="mb-7 text-sm leading-5 text-muted">
                    Paciente desde {patient.desde ?? "—"}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <span
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm ${
                    active
                        ? "bg-success-bg text-success-fg"
                        : "bg-warning-bg text-warning-fg"
                    }`}
                >
                    {patient.status}
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
                <Data title="Nome Completo" value={patient.nome} />

                <Data title="Celular / WhatsApp" value={patient.celular} />

                <Data title="Data de Nascimento" value={patient.nascimento} />

                <Data title="Idade" value={`${patient.idade} anos`} />

                <Data title="E-mail" value={patient.email} />

                <Data title="Médico responsável" value={patient.medico} />
              </dl>
            </Card>

            <Card title="Atividade recente">
              <ul>
                {atividades.map((a, i) => (
                  <li key={i} className="flex items-start gap-3.5 py-3">
                    <span
                      className={`mt-2 size-3 shrink-0 rounded-full ${i === 0 ? "bg-success-fg" : "bg-brand-300"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold">{a.titulo}</h4>
                      <p className="text-sm text-muted">{a.detalhe}</p>
                    </div>
                    <time className="text-sm whitespace-nowrap text-muted">
                      {a.data}
                    </time>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid content-start gap-5">
            <Card title="Equipamento atual">
              <dl className="grid gap-5">
                <Data title="CPAP" value={patient.cpap} />

                <Data title="Número de série" value={patient.serie} />

                <Data title="Máscara · Filtro" value={`${patient.mascara} · ${patient.filtro ?? "—"}`} />
              </dl>
            </Card>

            <Card title="Próximo lembrete">
              <p className="text-base text-muted">{lembrete.nome}</p>
              <p className="mt-2 text-base font-semibold text-link">
                {lembrete.quando}
              </p>
            </Card>

            <Card title="Documentos">
              <p className="text-base font-semibold text-link">
                {documento.nome}
              </p>
              <p className="mt-1 text-sm text-muted">{documento.info}</p>
              <button
                type="button"
                onClick={() => setTab("Documentos")}
                className="mt-6 cursor-pointer text-sm font-semibold text-link"
              >
                Ver documento →
              </button>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
