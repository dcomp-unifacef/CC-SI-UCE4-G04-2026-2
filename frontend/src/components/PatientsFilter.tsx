import { useState } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import type { Filters } from "../hooks/usePatients";
import type { CpapModel } from "../services/patients";
import { patientStatusLabels } from "../utils/labels";

type Props = {
  filters: Filters;
  cpapModels: CpapModel[];
  hasFilters: boolean;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
};

export default function PatientsFilter({
  filters,
  cpapModels,
  hasFilters,
  onFilterChange,
  onClear,
}: Props) {
  const [openFilters, setOpenFilters] = useState(false);
  const selectedModel = cpapModels.find((m) => m.id === filters.cpapModelId);

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <label className="flex items-center gap-3 min-h-12 px-5 rounded-lg bg-surface text-muted flex-1 min-w-58  focus-within:ring-2 focus-within:ring-primary">
          <Search size={20} />
          <input
            type="search"
            className="outline-none bg-transparent w-full"
            aria-label="Buscar pacientes"
            placeholder="Buscar por nome, CPF ou série do CPAP..."
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

        {filters.cpapModelId && (
          <button
            type="button"
            className="bg-link text-primary-foreground py-2 px-3 rounded-lg cursor-pointer"
            aria-label="Remover filtro de CPAP"
            onClick={() => onFilterChange("cpapModelId", "")}
          >
            CPAP: {selectedModel ? `${selectedModel.manufacturer} ${selectedModel.model}` : "selecionado"} x
          </button>
        )}

        {filters.status && (
          <button
            type="button"
            className="bg-link text-primary-foreground py-2 px-3 rounded-lg cursor-pointer"
            aria-label="Remover filtro de status"
            onClick={() => onFilterChange("status", "")}
          >
            Status: {patientStatusLabels[filters.status][0]} x
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
        <div className="flex flex-wrap gap-4 -mt-2 mb-6 p-4" id="filtros-pacientes">
          <label className="flex gap-2 bg-surface rounded-lg px-4 py-3">
            CPAP
            <select
              className="outline-none"
              value={filters.cpapModelId}
              onChange={(e) => {
                onFilterChange("cpapModelId", e.target.value);
              }}
            >
              <option value="" className="text-black">
                Todos
              </option>

              {cpapModels.map((model) => (
                <option key={model.id} value={model.id} className="text-black">
                  {model.manufacturer} {model.model}
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
              {Object.entries(patientStatusLabels).map(([value, [label]]) => (
                <option key={value} value={value} className="text-black">
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </>
  );
}
