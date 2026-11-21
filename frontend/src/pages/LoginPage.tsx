import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AtSign, Lock } from "lucide-react";
import Field from "../components/Field";
import { useForm } from "../hooks/useForm";
import { useAuth } from "../contexts/AuthContext";
import { apiErrorMessage } from "../services/api";

const loginForm = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { form, handleChange } = useForm(loginForm, () => setError(""));

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      const from = (location.state as { from?: { pathname: string } } | null)
        ?.from?.pathname;
      navigate(from ?? "/inicio", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "E-mail ou senha incorretos."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <title>Faça login | Sono Inteligente</title>

      <form className="w-full max-w-90 flex flex-col" onSubmit={handleSubmit}>
        <h1 className="m-0 text-3xl font-bold text-foreground">
          Entre na sua conta
        </h1>
        <p className="mt-2 mb-6 text-sm leading-normal text-muted">
          Informe seu e-mail e senha para acessar a plataforma.
        </p>

        <Field
          id="email"
          label="e-mail"
          icon={<AtSign size={16} />}
          type="email"
          placeholder="Digite seu e-mail"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
        />

        <Field
          id="password"
          label="senha"
          icon={<Lock size={16} />}
          type="password"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          extra={
            <Link
              to="/recuperar-acesso"
              className="text-xs text-link hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          }
        />

        {error && (
          <p role="alert" className="mb-2 text-center text-danger-fg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex justify-center items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold uppercase rounded-md py-2 px-4 mt-2 hover:brightness-150 transition-colors"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-2 text-sm text-center text-muted">
          Não tem uma conta?
          <Link
            to="/cadastro"
            className="text-sm text-link hover:underline ml-1"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </>
  );
}
