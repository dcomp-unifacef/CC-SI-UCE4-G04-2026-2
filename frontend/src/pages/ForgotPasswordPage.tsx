import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import Logo from "../components/Logo";
import Field from "../components/Field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setSent(true);
  }

  return (
    <main className="flex justify-center items-center min-h-screen py-8 px-4">
      <section className="w-full max-w-lg bg-surface rounded-3xl shadow-lg py-20 px-16">
        <Logo className="w-72 h-auto mx-auto mb-6" />

        <h1 className="mt-12 mb-2 text-3xl font-bold text-foreground">
          Recuperar acesso
        </h1>
        <p className="m-0 text-sm leading-normal text-muted">
          Informe seu e-mail cadastrado. Enviaremos instruções para redefinir
          sua senha com segurança.
        </p>

        <form className="flex flex-col mt-6" onSubmit={handleSubmit}>
          <Field
            id="email"
            label="e-mail"
            icon={<Mail size={16} />}
            type="email"
            placeholder="Digite seu e-mail"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (sent) setSent(false);
            }}
          />

          <button
            type="submit"
            className="flex justify-center items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold uppercase rounded-md py-2 px-4 hover:brightness-150 transition-colors mt-2"
          >
            Enviar
          </button>

          {sent && (
            <p role="alert" className="mt-4 text-sm text-center text-muted">
              Se o e-mail estiver cadastrado, você receberá as instruções em
              instantes.
            </p>
          )}
        </form>

        <p className="mt-5 text-sm text-center text-muted">
          Lembrou sua senha?
          <Link to="/login" className="text-sm text-link hover:underline ml-1">
            Voltar para login
          </Link>
        </p>
      </section>
    </main>
  );
}
