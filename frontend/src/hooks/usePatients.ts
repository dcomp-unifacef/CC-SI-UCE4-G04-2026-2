import { useCallback, useEffect, useState } from "react";
import {
  fetchCpapModels,
  fetchPatients,
  type CpapModel,
  type Patient,
  type PatientStatus,
} from "../services/patients";

export type Filters = {
  search: string;
  cpapModelId: string;
  status: PatientStatus | "";
};

export const PER_PAGE = 8;
const SEARCH_DELAY = 400;
const NO_FILTERS: Filters = { search: "", cpapModelId: "", status: "" };

type LoadStatus = "loading" | "error" | "ready";

type Result = {
  key: string;
  patients: Patient[];
  total: number;
  failed: boolean;
};

export function usePatients() {
  const [result, setResult] = useState<Result | null>(null);
  const [cpapModels, setCpapModels] = useState<CpapModel[]>([]);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(filters.search.trim()), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchCpapModels()
      .then(setCpapModels)
      .catch(() => setCpapModels([]));
  }, []);

  const key = JSON.stringify([
    page,
    search,
    filters.status,
    filters.cpapModelId,
    attempt,
  ]);

  useEffect(() => {
    let cancelled = false;
    fetchPatients({
      page,
      pageSize: PER_PAGE,
      search,
      status: filters.status,
      cpapModelId: filters.cpapModelId,
    })
      .then((data) => {
        if (!cancelled) setResult({ key, ...data, failed: false });
      })
      .catch(() => {
        if (!cancelled)
          setResult({ key, patients: [], total: 0, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [key, page, search, filters.status, filters.cpapModelId]);

  let loadStatus: LoadStatus = "loading";
  if (result?.key === key) loadStatus = result.failed ? "error" : "ready";

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(NO_FILTERS);
    setSearch("");
    setPage(1);
  }

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return {
    filters,
    hasFilters: Object.values(filters).some(Boolean),
    cpapModels,
    total: result?.total ?? 0,
    patients: result?.patients ?? [],
    loadStatus,
    page,
    setPage,
    updateFilter,
    clearFilters,
    reload,
  };
}
