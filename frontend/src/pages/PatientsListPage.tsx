import { usePatients } from "../hooks/usePatients";
import PatientsTable from "../components/PatientsTable";
import { Link } from "react-router-dom";
import PatientsFilter from "../components/PatientsFilter";

export default function PatientsListPage() {
  const {
    filters,
    hasFilters,
    cpapModels,
    total,
    patients,
    loadStatus,
    page,
    setPage,
    updateFilter,
    clearFilters,
    reload,
  } = usePatients();

  return (
    <>
      <div className="flex justify-between items-center mb-6 max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-2">
        <div>
          <h2 className="text-[30px] leading-10 font-bold text-foreground max-[800px]:text-[25px]">
            Pacientes
          </h2>

          <p className="mb-7 text-sm leading-5 text-muted">
            Gerencie os pacientes e seus dados de acompanhamento.
          </p>
        </div>

        <Link
          to="/pacientes/novo"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md inline-flex items-center justify-center min-h-10 px-4 py-3"
        >
          Novo paciente
        </Link>
      </div>

      <PatientsFilter
        filters={filters}
        cpapModels={cpapModels}
        hasFilters={hasFilters}
        onFilterChange={updateFilter}
        onClear={clearFilters}
      />

      {loadStatus === "error" && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-danger-bg px-5 py-4 text-danger-fg"
        >
          <span>Não foi possível carregar os pacientes.</span>
          <button
            type="button"
            onClick={reload}
            className="cursor-pointer font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <PatientsTable
        patients={patients}
        total={total}
        loading={loadStatus === "loading"}
        page={page}
        onPage={setPage}
      />
    </>
  );
}
