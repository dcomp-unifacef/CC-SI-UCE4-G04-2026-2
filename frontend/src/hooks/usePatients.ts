import { useState } from "react";
import { listaPacientes } from "../data/listaPacientes";

export type Patient = (typeof listaPacientes)[number];
export type NewPatient = Omit<Patient, "id" | "status">;
export type Filters = { search: string; cpap: string; status: string };

export const PER_PAGE = 8;
const NO_FILTERS: Filters = { search: "", cpap: "", status: "" };

const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
};

export function usePatients() {
  const [patients, setPatients] = useState(listaPacientes);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);

  const term = normalizeText(filters.search.trim());
  const filtered = patients.filter(
    (p) =>
      normalizeText(`${p.nome} ${p.cpap} ${p.serie}`).includes(term) &&
      (!filters.cpap || p.cpap === filters.cpap) &&
      (!filters.status || p.status === filters.status),
  );

  // Qualquer mudança de filtro volta para a primeira página
  function updateFilter(chave: keyof Filters, valor: string) {
    setFilters((atual) => ({ ...atual, [chave]: valor }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(NO_FILTERS);
    setPage(1);
  }

  function addPatient(novo: NewPatient) {
    setPatients((atual) => [
      ...atual,
      { ...novo, id: Math.max(0, ...atual.map((p) => p.id)) + 1, status: "Ativo" },
    ]);
    clearFilters(); // garante que o novo paciente apareça na lista
  }

  return {
    filters,
    hasFilters: Object.values(filters).some(Boolean),
    CpapModels: [...new Set(patients.map((p) => p.cpap))],
    total: filtered.length,
    viewable: filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    page,
    setPage,
    updateFilter,
    clearFilters,
    addPatient,
  };
}
