import { useState } from "react";
import { matchPath, Outlet, useLocation } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";

const links = [
  ["/inicio", "Visão geral"],
  ["/pacientes", "Pacientes"],
  ["/mensagens", "Mensagens"],
  ["/relatorios", "Relatórios"],
  ["/automacoes", "Automações"],
  ["/configuracoes", "Configurações"],
];

const titles: [string, string][] = [
  ["/inicio", "Dashboard - Visão geral"],
  ["/pacientes/novo", "Novo paciente"],
  ["/pacientes/:id", "Detalhes do paciente"],
  ["/pacientes", "Pacientes"],
  ["/agenda", "Agenda & Visitas"],
  ["/estoque", "Estoque & Produtos"],
  ["/configuracoes/lembretes", "Lembretes"],
  ["/configuracoes", "Configurações"],
  ["/mensagens", "Mensagens"],
  ["/relatorios", "Relatórios"],
  ["/automacoes", "Automações"],
];

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(
    () => window.matchMedia("(max-width: 800px)").matches,
  );
  const { pathname } = useLocation();
  const title =
    titles.find(([path]) => matchPath({ path, end: true }, pathname))?.[1] ??
    "Sono Inteligente";

  return (
    <main className="min-h-screen bg-background">
      <Sidebar
        links={links}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <section
        className={`max-[800px]:ml-0 ${isCollapsed ? "ml-18" : "ml-63"}`}
      >
        <Header
          title={title}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <section className="p-[43px_30px_60px_34px] min-[1500px]:pr-15 max-[800px]:p-[26px_18px]">
          <Outlet />
        </section>
      </section>
    </main>
  );
}
