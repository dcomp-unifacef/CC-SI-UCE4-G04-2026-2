import { useRef, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Upload } from "lucide-react";
import Field from "../components/Field";
import { listaPacientes } from "../data/listaPacientes";
import { useForm } from "../hooks/useForm";

const patientForm= {
    nome: "",
    cpf: "",
    dataNascimento: "",
    celular: "",
    email: "",
    cep: "",
    inicioUso: "",
    cpap: "",
    serie: "",
    filtro: "",
    mascara: "",
    plataforma: "",
    medico: ""
};

const models = ["AirSense 10", "DreamStation 2", "AirSense 11", "Luna G3", "DreamStation"];
const filters = ["Lavável", "Descartável"];
const masks = ["AirFit N20", "DreamWear", "AirFit F30i", "BMC N5A", "AirFit P10", "BMC F5"];
const platforms = ["AirView", "DreamMapper", "myAir"];

const TAMANHO_MAX = 20 * 1024 * 1024;

export default function PatientFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === undefined;
    const patient = isNew ? undefined : listaPacientes.find((p) => p.id === Number(id));

    const { form, handleChange } = useForm(patientForm);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");
    const dialog = useRef<HTMLDialogElement>(null);

    if (!isNew && !patient) {
        return (
        <p className="text-muted">
            Paciente não encontrado. <Link className="text-link" to="/pacientes">Voltar para a lista</Link>
        </p>
        );
    }

    function chooseFile(e: ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0] ?? null;

        if (selected && selected.size > TAMANHO_MAX) {
        e.target.value = "";
        setFile(null);
        setFileError("O arquivo excede 20 MB.");
        return;
        }

        setFileError("");
        setFile(selected);
    }

    function save(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: enviar `form` e `file` para a API
        console.log(isNew ? "cadastrar" : "editar", { ...form, polissonografia: file });
        navigate(isNew ? "/pacientes" : `/pacientes/${patient?.id}`);
    }

    function deactivate() {
        dialog.current?.close();
        // TODO: marcar o paciente como inativo na API / estado global
        navigate(`/pacientes/${id}`);
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
                        id="nome"
                        label="Nome completo"
                        required
                        placeholder="Preencher nome completo"
                        value={form.nome}
                        onChange={handleChange}
                    />
                
                    <Field
                        id="cpf"
                        label="CPF"
                        required
                        placeholder="000.000.000-00"
                        value={form.cpf}
                        onChange={handleChange}
                    />

                    <Field
                        id="dataNascimento"
                        label="Data de Nascimento"
                        type="date"
                        value={form.dataNascimento}
                        onChange={handleChange}
                    />

                    <Field
                        id="celular"
                        label="Celular / WhatsApp"
                        required
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={form.celular}
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
                        placeholder="Preencher CEP"
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
                        id="inicioUso"
                        label="Início do Uso"
                        required
                        type="date"
                        value={form.inicioUso}
                        onChange={handleChange}
                    />

                    <Field
                        id="cpap"
                        label="Modelo CPAP"
                        required
                        options={models}
                        value={form.cpap}
                        onChange={handleChange}
                    />

                    <Field
                        id="serie"
                        label="Número de série"
                        placeholder="Preencher número de série"
                        value={form.serie}
                        onChange={handleChange}
                    />

                    <Field
                        id="filtro"
                        label="Tipo de Filtro"
                        required
                        options={filters}
                        value={form.filtro}
                        onChange={handleChange}
                    />

                    <Field
                        id="mascara"
                        label="Máscara Atual"
                        options={masks}
                        value={form.mascara}
                        onChange={handleChange}
                    />

                    <Field
                        id="plataforma"
                        label="Plataforma"
                        options={platforms}
                        value={form.plataforma}
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
                    id="medico"
                    label="Médico Responsável"
                    placeholder="Nome do Médico"
                    value={form.medico}
                    onChange={handleChange}
                />

                <label className="grid cursor-pointer content-center gap-1 rounded-lg bg-background px-5 py-4 focus-within:outline-2 focus-within:outline-link">
                    <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-link">
                        <Upload size={18} /> {file ? file.name : "Adicionar polissonografia (PDF)"}
                    </span>

                    <small className={`text-[11px] ${fileError ? "text-danger-fg" : "text-muted"}`}>
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          {!isNew && patient?.status !== "Pausado" ? (
            <button
              type="button"
              onClick={() => dialog.current?.showModal()}
              className="cursor-pointer text-sm font-semibold text-danger-fg"
            >
              Desativar acompanhamento
            </button>
          ) : <span />}

          <div className="flex gap-3">
            <Link
              to={isNew ? "/pacientes" : `/pacientes/${id}`}
              className={"inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link border border-border bg-secondary text-secondary-foreground"}
            >
              Cancelar
            </Link>
            <button type="submit" className={"inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link bg-primary text-primary-foreground"}>
              Salvar paciente
            </button>
          </div>
        </div>
      </form>

      <dialog
        ref={dialog}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[20px] bg-surface p-8 text-card-foreground backdrop:bg-[#17384a]"
      >
        <span className="grid size-13 place-items-center rounded-full bg-warning-bg text-2xl font-bold text-warning-fg">!</span>

        <h2 className="mt-6 text-2xl font-bold text-foreground">Desativar acompanhamento?</h2>
        <p className="mt-3 text-[15px] leading-6 text-muted">
          {patient?.nome} deixará de receber lembretes e não será incluída nas próximas automações de relatórios.
        </p>

        <div className="mt-6 rounded-lg bg-background px-5 py-4">
          <p className="block text-base font-semibold">O histórico e os documentos serão preservados.</p>
          <p className="text-sm text-muted">Você poderá reativar o acompanhamento depois.</p>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => dialog.current?.close()} className={"inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link text-muted"}>
            Manter ativo
          </button>

          <button type="button" onClick={deactivate} className={"inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link bg-[#b54747] text-white"}>
            Desativar paciente
          </button>
        </div>
      </dialog>
    </>
  );
}