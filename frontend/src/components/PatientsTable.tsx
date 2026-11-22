import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PER_PAGE } from "../hooks/usePatients";
import type { Patient } from "../services/patients";
import { badgeClasses, patientStatusLabels } from "../utils/labels";

type Props = {
  patients: Patient[];
  page: number;
  total: number;
  loading: boolean;
  onPage: (page: number) => void;
};

export default function PatientsTable({
  patients,
  total,
  loading,
  page,
  onPage,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const startIndex = total ? (page - 1) * PER_PAGE + 1 : 0;
  const endIndex = Math.min(page * PER_PAGE, total);

  return (
    <section
      className="bg-surface rounded-lg overflow-hidden text-card-foreground"
      aria-label="Lista de pacientes"
    >
      <table className="w-full border-collapse text-left text-xs max-[800px]:block">
        <thead className="h-13 text-sm text-primary">
          <tr>
            <th className="px-4 py-3 font-semibold">PACIENTE</th>
            <th className="px-4 py-3 font-semibold">IDADE</th>
            <th className="px-4 py-3 font-semibold">CPAP / SÉRIE</th>
            <th className="px-4 py-3 font-semibold">MÁSCARA</th>
            <th className="px-4 py-3 font-semibold">MÉDICO</th>
            <th className="px-4 py-3 font-semibold">STATUS</th>
          </tr>
        </thead>

        <tbody className="max-[800px]:block">
          {patients.map((p) => {
            const [statusLabel, statusColor] = patientStatusLabels[p.status];
            return (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <Link
                    to={`/pacientes/${p.id}`}
                    className="block text-sm font-semibold hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
                  >
                    {p.fullName}
                  </Link>
                  <small className="mt-1 block text-[11px] text-muted">
                    {p.whatsappOptIn
                      ? "WhatsApp autorizado"
                      : "WhatsApp não autorizado"}
                  </small>
                </td>
                <td className="px-4 py-3">
                  {p.age === null ? "-" : `${p.age} anos`}
                </td>
                <td className="px-4 py-3">
                  {p.cpapModelName ?? "-"} · {p.cpapSerialNumber ?? "-"}
                </td>
                <td className="px-4 py-3">{p.maskModel ?? "-"}</td>
                <td className="px-4 py-3">{p.physicianName ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block min-w-23 rounded-md px-2 py-1 ${badgeClasses[statusColor]}`}
                  >
                    {statusLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {loading && patients.length === 0 && (
        <p className="text-center p-10 text-muted" role="status">
          Carregando pacientes...
        </p>
      )}

      {!loading && patients.length === 0 && (
        <p className="text-center p-10 text-muted" role="status">
          Nenhum paciente encontrado. Tente outra busca ou limpe os filtros.
        </p>
      )}

      <footer className="flex justify-between items-center gap-4 p-6 text-muted">
        <span>
          Mostrando {startIndex}-{endIndex} de {total} pacientes
        </span>

        <nav
          aria-label="Paginação de pacientes"
          className="flex items-center gap-2"
        >
          <button
            type="button"
            aria-label="Página anterior"
            disabled={page === 1}
            onClick={() => onPage(page - 1)}
            className="h-8 min-w-8 cursor-pointer rounded-md text-card-foreground disabled:cursor-default disabled:opacity-45 aria-[current=page]:bg-highlight aria-[current=page]:text-link"
          >
            <ChevronLeft size={16} className="mx-auto" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              type="button"
              key={i}
              aria-current={page === i + 1 ? "page" : undefined}
              onClick={() => onPage(i + 1)}
              className="h-8 min-w-8 cursor-pointer rounded-md text-card-foreground disabled:cursor-default disabled:opacity-45 aria-[current=page]:bg-highlight aria-[current=page]:text-link"
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            disabled={page === totalPages}
            aria-label="Próxima página"
            onClick={() => onPage(page + 1)}
            className="h-8 min-w-8 cursor-pointer rounded-md text-card-foreground disabled:cursor-default disabled:opacity-45 aria-[current=page]:bg-highlight aria-[current=page]:text-link"
          >
            <ChevronRight size={16} className="mx-auto" />
          </button>
        </nav>
      </footer>
    </section>
  );
}
