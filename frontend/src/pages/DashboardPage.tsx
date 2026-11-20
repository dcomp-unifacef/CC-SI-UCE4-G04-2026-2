import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { atividades, indicadores, lembretes } from "../data/visaoGeral";

const corStatus: Record<string, string> = {
  sucesso: "text-success-fg",
  atencao: "text-warning-fg",
  falha: "text-danger-fg",
};

export default function Inicio() {
  return (
    <>
      <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
        Bom dia, Hitalo 👋
      </h2>

      <p className="mb-7 text-sm leading-5 text-muted">
        Aqui está o resumo do acompanhamento de hoje.
      </p>

      <section
        aria-label="Resumo do acompanhamento"
        className="mb-6 grid grid-cols-4 gap-4 max-[800px]:grid-cols-2 max-[800px]:gap-3"
      >
        {indicadores.map((item) => (
          <article
            className="rounded-[13px] bg-surface p-5 min-h-33"
            key={item.titulo}
          >
            <h3 className="mb-2.5 text-[13px] font-semibold text-muted">
              {item.titulo}
            </h3>
            <strong className="block text-[30px] leading-10 text-foreground">
              {item.valor}
            </strong>
            <p className="mt-1 text-xs text-muted">{item.nota}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-[700fr_406fr] gap-5 max-[1190px]:grid-cols-1">
        <section className="rounded-[13px] bg-surface p-5 px-6 py-5 min-h-90 text-card-foreground max-[800px]:p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold max-[800px]:text-lg">
              Atividade recente
            </h3>
            <Link className="text-xs text-link" to="/mensagens">
              Ver histórico →
            </Link>
          </div>

          <ul>
            {atividades.map((item) => (
              <li
                key={item.titulo}
                className="grid min-h-17 grid-cols-[minmax(0,1fr)_100px_94px] gap-2 border-b border-border py-4 max-[800px]:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="max-[800px]:row-span-2">
                  <h4 className="text-sm font-semibold">{item.titulo}</h4>
                  <p className="mt-1 text-xs text-muted">{item.detalhe}</p>
                </div>
                <time className="pt-0.5 text-[11px] text-muted max-[800px]:text-right">
                  {item.data}
                </time>
                <Link
                  to={item.rota}
                  className={`self-end text-[11px] whitespace-nowrap max-[800px]:text-right ${corStatus[item.cor]}`}
                >
                  {item.status}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[13px] bg-surface p-5 px-6 py-5 min-h-90 text-card-foreground max-[800px]:p-5">
          <h3 className="text-xl font-semibold max-[800px]:text-lg">
            Próximos lembretes
          </h3>
          <p className="mt-5 mb-4 text-xs text-muted">Hoje</p>

          <ul>
            {lembretes.map((item) => (
              <li key={item.nome} className="mb-8 flex items-center gap-3.5">
                <span className="grid size-9 place-items-center rounded-[9px] bg-highlight text-link">
                  <Clock size={17} />
                </span>
                <div>
                  <h4 className="text-[13px] font-semibold">{item.nome}</h4>
                  <p className="mt-1 text-[11px] text-muted">{item.detalhe}</p>
                </div>
                <time className="ml-auto text-xs">{item.hora}</time>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-7 flex min-h-23 items-center justify-between gap-5 rounded-[13px] bg-highlight px-6 py-5 text-link max-[800px]:flex-col max-[800px]:items-start">
        <div>
          <h3 className="mb-1.5 text-[17px] font-semibold">
            Acompanhamento em dia
          </h3>
          <p className="text-[13px] text-muted">
            As automações estão ativas. Próxima sincronização de relatórios às
            18:00.
          </p>
        </div>
        <Link className="text-[13px] whitespace-nowrap" to="/automacoes">
          Ver automações →
        </Link>
      </section>
    </>
  );
}
