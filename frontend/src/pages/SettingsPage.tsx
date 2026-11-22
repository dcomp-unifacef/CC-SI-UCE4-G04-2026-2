import { useState } from "react";
import type { SubmitEvent } from "react";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";
import Field from "../components/Field";
import ThemeSelector from "../components/ThemeSelector";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "../hooks/useForm";
import { apiErrorMessage } from "../services/api";
import { changePassword, updateProfile } from "../services/settings";

type Section = "perfil" | "preferencias";

const nav = [
  { label: "Perfil do administrador", section: "perfil" },
  { label: "Segurança e senha", section: "perfil", anchor: "seguranca" },
  { label: "WhatsApp", to: "/mensagens/reconectar" },
  { label: "Lembretes", to: "/configuracoes/lembretes" },
  { label: "Modelos CPAP e filtros", to: "/configuracoes/lembretes" },
  { label: "Portais de relatórios", to: "/automacoes" },
  { label: "Preferências gerais", section: "preferencias" },
] as const;

const navClass = (active: boolean) =>
  `block w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm whitespace-nowrap focus-visible:outline-2 focus-visible:outline-link ${
    active ? "bg-highlight font-semibold text-link" : "text-muted hover:bg-highlight"
  }`;

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("perfil");

  function open(next: Section, anchor?: string) {
    setSection(next);
    if (anchor) {
      requestAnimationFrame(() =>
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" }),
      );
    }
  }

  return (
    <>
      <header className="mb-6">
        <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">Configurações</h2>
        <p className="text-sm leading-6 text-muted">Personalize o sistema e as regras de acompanhamento.</p>
      </header>

      <div className="grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-5 max-[1190px]:grid-cols-1">
        <nav aria-label="Seções de configurações" className="rounded-[13px] bg-surface p-4">
          <ul className="grid gap-1 max-[1190px]:flex max-[1190px]:overflow-x-auto">
            {nav.map((item) => (
              <li key={item.label}>
                {"to" in item ? (
                  <Link to={item.to} className={navClass(false)}>{item.label}</Link>
                ) : (
                  <button
                    type="button"
                    aria-current={item.section === section && !("anchor" in item) ? "page" : undefined}
                    onClick={() => open(item.section, "anchor" in item ? item.anchor : undefined)}
                    className={navClass(item.section === section && !("anchor" in item))}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {section === "perfil" ? <ProfilePanel /> : <PreferencesPanel />}
      </div>
    </>
  );
}

function ProfilePanel() {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { form, handleChange } = useForm(
    { name: user?.name ?? "", email: user?.email ?? "" },
    () => {
      setSaved(false);
      setError("");
    },
  );

  async function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      updateUser(await updateProfile(form));
      setSaved(true);
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 409
          ? "Este e-mail já está em uso."
          : apiErrorMessage(err, "Não foi possível salvar as alterações."),
      );
    }
    setSaving(false);
  }

  return (
    <section className="rounded-[13px] bg-surface p-8 text-card-foreground flex flex-col">
      <h3 className="text-2xl font-semibold">Perfil do administrador</h3>
      <p className="mb-6 text-sm text-muted">Atualize as informações de acesso e contato.</p>

      <form id="perfil-form" onSubmit={save} className="grid grid-cols-2 gap-x-6 max-[800px]:grid-cols-1">
        <Field id="name" label="Nome" required value={form.name} onChange={handleChange} />
        <Field id="email" label="E-mail" type="email" required value={form.email} onChange={handleChange} />
      </form>

      <section id="seguranca" className="mt-4 scroll-mt-6 border-t border-border pt-8">
        <h4 className="text-xl font-semibold">Segurança</h4>
        <p className="text-sm text-muted">Ao alterar a senha, você precisará entrar novamente.</p>

        {changingPassword ? (
          <PasswordForm onCancel={() => setChangingPassword(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setChangingPassword(true)}
            className="mt-4 cursor-pointer text-base font-semibold text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
          >
            Alterar senha
          </button>
        )}

        <p className="mt-6 text-sm text-muted">Dica: use uma senha longa e exclusiva para esta conta.</p>
      </section>

      <div className="mt-8 flex items-center justify-end gap-4">
        {error && <p role="alert" className="text-sm text-danger-fg">{error}</p>}
        {saved && <p role="status" className="text-sm text-success-fg">Alterações salvas.</p>}
        <button
          type="submit"
          form="perfil-form"
          disabled={saving}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link disabled:cursor-default disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </section>
  );
}

function PasswordForm({ onCancel }: { onCancel: () => void }) {
  const { logout } = useAuth();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { form, handleChange } = useForm({ current: "", next: "", confirm: "" }, () => setError(""));

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (form.next.length < 12 || !/[A-Za-z]/.test(form.next) || !/\d/.test(form.next)) {
      setError("A nova senha deve ter 12 caracteres, com letras e números.");
      return;
    }
    if (form.next !== form.confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(form.current, form.next);
      await logout();
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 401
          ? "Senha atual incorreta."
          : apiErrorMessage(err, "Não foi possível alterar a senha."),
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid max-w-sm">
      <Field id="current" label="Senha atual" type="password" required autoComplete="current-password" value={form.current} onChange={handleChange} />
      <Field id="next" label="Nova senha" type="password" required autoComplete="new-password" value={form.next} onChange={handleChange} />
      <Field id="confirm" label="Confirmar nova senha" type="password" required autoComplete="new-password" value={form.confirm} onChange={handleChange} />

      {error && <p role="alert" className="mb-2 text-sm text-danger-fg">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link disabled:cursor-default disabled:opacity-60">
          {saving ? "Atualizando..." : "Atualizar senha"}
        </button>
        <button type="button" onClick={onCancel} className="cursor-pointer px-4 text-sm text-muted">Cancelar</button>
      </div>
    </form>
  );
}

function PreferencesPanel() {
  return (
    <section className="rounded-[13px] bg-surface p-8 text-card-foreground">
      <h3 className="text-2xl font-semibold">Preferências gerais</h3>
      <p className="mb-6 text-sm text-muted">Ajuste a aparência do sistema.</p>

      <h4 className="mb-1 text-base font-semibold">Tema</h4>
      <p className="mb-4 text-sm text-muted">
        "Dispositivo" acompanha o tema claro ou escuro do seu sistema operacional.
      </p>
      <ThemeSelector />
    </section>
  );
}