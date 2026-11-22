import { useState } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import type { Filters } from "../hooks/usePatients";

type Props = {
  filters: Filters;
  CpapModels: string[];
  hasFilters: boolean;
  onFilterChange: (chave: keyof Filters, valor: string) => void;
  onClear: () => void;
};

export default function PatientsFilter({
  filters,
  CpapModels,
  hasFilters,
  onFilterChange,
  onClear,
}: Props) {
  const [openFilters, setOpenFilters] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <label className="flex items-center gap-3 min-h-12 px-5 rounded-lg bg-surface text-muted flex-1 min-w-58  focus-within:ring-2 focus-within:ring-primary">
          <Search size={20} />
          <input
            type="search"
            className="outline-none bg-transparent w-full"
            aria-label="Buscar pacientes"
            placeholder="Buscar por nome ou série do CPAP..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </label>

        <button
          className={`inline-flex items-center justify-center gap-2 min-h-11 py-3 px-2 rounded-lg bg-surface text-muted hover:cursor-pointer ${openFilters ? "ring-2 ring-primary" : ""}`}
          aria-expanded={openFilters}
          aria-controls="filtros-pacientes"
          onClick={() => setOpenFilters(!openFilters)}
        >
          {openFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          Filtros
        </button>

        {filters.cpap && (
          <button
            type="button"
            className="bg-link text-primary-foreground py-2 px-3 rounded-lg cursor-pointer"
            aria-label="Remover filtro de CPAP"
            onClick={() => onFilterChange("cpap", "")}
          >
            CPAP: {filters.cpap} x
          </button>
        )}

        {filters.status && (
          <button
            type="button"
            className="bg-link text-primary-foreground py-2 px-3 rounded-lg cursor-pointer"
            aria-label="Remover filtro de status"
            onClick={() => onFilterChange("status", "")}
          >
            Status: {filters.status} x
          </button>
        )}

        {hasFilters && (
          <button
            type="button"
            className="bg-surface text-link py-2 px-3 rounded-lg cursor-pointer"
            aria-label="Remover todos os filtros"
            onClick={onClear}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {openFilters && (
        <div className="flex flex-wrap gap-4 -mt-2 mb-6 p-4" id="sono-filtros">
          <label className="flex gap-2 bg-surface rounded-lg px-4 py-3">
            CPAP
            <select
              className="outline-none"
              value={filters.cpap}
              onChange={(e) => {
                onFilterChange("cpap", e.target.value);
              }}
            >
              <option value="" className="text-black">
                Todos
              </option>

              {CpapModels.map((model) => (
                <option key={model} className="text-black">
                  {model}
                </option>
              ))}
            </select>
          </label>

          <label className="flex gap-2 bg-surface rounded-lg px-4 py-3">
            Status
            <select
              className="outline-none"
              value={filters.status}
              onChange={(e) => {
                onFilterChange("status", e.target.value);
              }}
            >
              <option value="" className="text-black">
                Todos
              </option>
              <option className="text-black">Ativo</option>
              <option className="text-black">Pausado</option>
            </select>
          </label>
        </div>
      )}
    </>
  );
}
