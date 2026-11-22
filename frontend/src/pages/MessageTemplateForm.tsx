import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import Field from "../components/Field";
import { useForm } from "../hooks/useForm";
import { apiErrorMessage } from "../services/api";
import { fetchTemplate, updateTemplate, type Template } from "../services/messages";
import { messageCategoryLabels } from "../utils/labels";

const templateVariables = ["{{nome}}", "{{link_video}}"];

const categoryOptions = Object.entries(messageCategoryLabels).map(
  ([value, label]) => ({ value, label }),
);

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error" }
  | { status: "ready"; template: Template };

function TemplateLoader({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchTemplate(id)
      .then((template) => {
        if (!cancelled) setState({ status: "ready", template });
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
          ? "Modelo não encontrado."
          : "Não foi possível carregar o modelo."}{" "}
        <Link className="text-link" to="/mensagens">Voltar para mensagens</Link>
      </p>
    );
  }

  return <TemplateFormFields template={state.template} />;
}

export default function MessageTemplateForm() {
  const { id } = useParams();
  if (!id) return null;
  return <TemplateLoader key={id} id={id} />;
}

function TemplateFormFields({ template }: { template: Template }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { form, handleChange } = useForm(
    {
      name: template.name,
      category: template.category,
      mediaUrl: template.mediaUrl ?? "",
    },
    () => setError(""),
  );
  const [body, setBody] = useState(template.body);
  const textarea = useRef<HTMLTextAreaElement>(null);

  function insertVariable(variable: string) {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    setBody(body.slice(0, start) + variable + body.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + variable.length, start + variable.length);
    });
  }

  async function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateTemplate(template.id, {
        name: form.name,
        category: form.category,
        body,
        mediaUrl: form.mediaUrl,
      });
      navigate("/mensagens");
    } catch (err) {
      const forbidden = isAxiosError(err) && err.response?.status === 403;
      setError(
        forbidden
          ? "Somente administradores podem editar modelos."
          : apiErrorMessage(err, "Não foi possível salvar o modelo."),
      );
      setSaving(false);
    }
  }

  const preview = body
    .replaceAll("{{nome}}", "Maria")
    .replaceAll("{{link_video}}", form.mediaUrl || "https://sono.example/video");

  return (
    <form onSubmit={save}>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-x-5 gap-y-3.5">
        <div>
          <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
            Editar modelo de mensagem
          </h2>
          <p className="text-sm leading-6 text-muted">Configure o texto e as variáveis da mensagem.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link disabled:cursor-default disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar modelo"}
        </button>
      </header>

      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5 max-[1190px]:grid-cols-1">
        <section className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <h3 className="mb-5 text-xl font-semibold">Informações do modelo</h3>

          <Field id="name" label="Nome do modelo" required value={form.name} onChange={handleChange} />

          <Field id="category" label="Categoria" options={categoryOptions} value={form.category} onChange={handleChange} />

          <div className="mb-4">
            <label htmlFor="body" className="mb-1 block text-sm font-semibold uppercase text-card-foreground">
              Mensagem <span className="text-link">*</span>
            </label>
            <textarea
              id="body"
              name="body"
              ref={textarea}
              required
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm text-card-foreground outline-none focus:ring-1 focus:ring-link"
            />
          </div>

          <p className="mb-2 text-sm font-semibold text-muted">Variáveis disponíveis</p>
          <div className="mb-4 flex flex-wrap gap-3">
            {templateVariables.map((variable) => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                className="cursor-pointer rounded-full bg-highlight px-4 py-2 text-xs text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
              >
                {variable}
              </button>
            ))}
          </div>

          <Field
            id="mediaUrl"
            label="Vídeo de apoio (opcional)"
            type="url"
            placeholder="https://..."
            value={form.mediaUrl}
            onChange={handleChange}
            className="mb-0"
          />

          {error && (
            <p role="alert" className="mt-4 text-sm text-danger-fg">
              {error}
            </p>
          )}
        </section>

        <aside className="rounded-[13px] bg-surface p-6 text-card-foreground">
          <h3 className="mb-5 text-xl font-semibold">Prévia para o paciente</h3>

          <div aria-live="polite" className="min-h-70 rounded-2xl bg-highlight p-5 text-[15px] leading-6 whitespace-pre-line">
            {preview}
          </div>

          <p className="mt-6 text-sm text-muted">As variáveis serão preenchidas com os dados do paciente.</p>
          <p className="mt-2 text-xs text-muted">Prévia ilustrativa · confira antes de ativar</p>

          <p className="mt-6 rounded-lg bg-background p-5 text-sm font-semibold">
            Ativo após validação do conteúdo pelo administrador.
          </p>
        </aside>
      </div>
    </form>
  );
}