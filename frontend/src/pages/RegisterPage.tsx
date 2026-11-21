import { useState, type SubmitEvent } from "react";
import { User, AtSign, Lock, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { useForm } from "../hooks/useForm";
import { useAuth } from "../contexts/AuthContext";
import { apiErrorMessage } from "../services/api";

const registerForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { form, handleChange } = useForm(registerForm, () => setError(""));

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      form.password.length < 12 ||
      !/[A-Za-z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      setError("A senha deve ter 12 caracteres, com letras e números.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/inicio", { replace: true });
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          "O cadastro está fechado. Peça a um administrador para criar sua conta.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <title>Crie uma conta | Sono Inteligente</title>

      <form className="w-full max-w-90 flex flex-col" onSubmit={handleSubmit}>
        <h1 className="m-0 text-3xl font-bold text-foreground">
          Crie sua conta
        </h1>
        <p className="mt-2 mb-6 text-sm leading-normal text-muted">
          Preencha os dados abaixo para acessar a plataforma.
        </p>

        <Field
          id="name"
          label="nome completo"
          icon={<User size={16} />}
          type="text"
          placeholder="Digite seu nome completo"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
        />

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

        <div className="grid grid-cols-2 gap-3">
          <Field
            id="password"
            label="senha"
            icon={<Lock size={16} />}
            type="password"
            placeholder="Digite sua senha"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />

          <Field
            id="confirmPassword"
            label="confirmar senha"
            icon={<ShieldCheck size={16} />}
            type="password"
            placeholder="Digite sua senha"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

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
          {loading ? "Criando..." : "Criar Conta"}
        </button>

        <p className="mt-2 text-sm text-center text-muted">
          Já possui uma conta?
          <Link to="/login" className="text-sm text-link hover:underline ml-1">
            Entrar
          </Link>
        </p>
      </form>
    </>
  );
}
