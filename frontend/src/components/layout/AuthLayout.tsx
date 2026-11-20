import { Outlet } from "react-router-dom";
import Logo from "../Logo";

export default function AuthLayout() {
  return (
    <main className="grid grid-cols-2 h-screen">
      <section className="flex flex-col h-screen py-8 px-9">
        <article className="flex-1 flex items-center justify-center">
          <Outlet />
        </article>

        <footer className="flex justify-center items-center">
          <span className="text-sm text-muted">
            Sono Inteligente © 2026 · Todos os direitos reservados
          </span>
        </footer>
      </section>

      <section className="flex justify-center items-center bg-[radial-gradient(80.01%_70.48%_at_50%_45%,#0D3B56_0%,#00405C_45%,#002240_100%)]">
        <Logo variant="branco" className="w-80 pb-15 h-auto" />
      </section>
    </main>
  );
}
