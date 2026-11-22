import { api } from "./api";
import type { ReportPlatform } from "./patients";

export type ReportStatus =
  | "AWAITING_MATCH"
  | "PROCESSING"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "SENT"
  | "FAILED";

export type ReportMetric = {
  key: string;
  value: string | null;
  valueText: string | null;
  unit: string | null;
};

export type Report = {
  id: string;
  patientId: string | null;
  platform: ReportPlatform;
  periodStart: string | null;
  periodEnd: string | null;
  status: ReportStatus;
  matchStatus: string;
  originalName: string;
  sizeBytes: number;
  matchIdentifier: string | null;
  createdAt: string;
  patient: { id: string; fullName: string; phone: string; status: string } | null;
  metrics: ReportMetric[];
};

export type ImportOptions = {
  platform: string;
  periodStart: string;
  periodEnd: string;
};

export type ImportResult = {
  file: string;
  status: string;
};

export type MetricsInput = {
  daysUsed: string;
  averageDailyUsage: string;
  adherence: string;
  ahi: string;
  leak: string;
};

const MAX_FILES_PER_REQUEST = 5;

export async function fetchReports(params: {
  patientId?: string;
  pageSize: number;
}) {
  const { data } = await api.get<{ data: Report[] }>("/reports", { params });
  return data.data;
}

export async function fetchReport(id: string) {
  const { data } = await api.get<{ report: Report }>(`/reports/${id}`);
  return data.report;
}

export async function fetchReportFile(id: string) {
  const { data } = await api.get<Blob>(`/reports/${id}/file`, {
    responseType: "blob",
  });
  return data;
}

export async function importReports(files: File[], options: ImportOptions) {
  const results: ImportResult[] = [];
  for (let i = 0; i < files.length; i += MAX_FILES_PER_REQUEST) {
    const body = new FormData();
    body.append("platform", options.platform);
    body.append("periodStart", options.periodStart);
    body.append("periodEnd", options.periodEnd);
    for (const file of files.slice(i, i + MAX_FILES_PER_REQUEST)) {
      body.append("files", file);
    }
    const { data } = await api.post<{ results: ImportResult[] }>(
      "/reports/import",
      body,
    );
    results.push(...data.results);
  }
  return results;
}

export async function associateReport(id: string, patientId: string) {
  await api.patch(`/reports/${id}/associate`, { patientId });
}

export async function approveReport(id: string) {
  await api.post(`/reports/${id}/approve`);
}

export async function saveMetrics(id: string, input: MetricsInput) {
  const metrics: {
    key: string;
    value?: number;
    valueText?: string;
    unit?: string;
  }[] = [];
  const numeric: [string, string, string | undefined][] = [
    ["days_used", input.daysUsed, "dias"],
    ["adherence", input.adherence, "%"],
    ["ahi", input.ahi, "eventos/h"],
    ["leak", input.leak, "L/min"],
  ];
  for (const [key, raw, unit] of numeric) {
    const text = raw.trim().replace(",", ".");
    if (!text) continue;
    const value = Number(text);
    if (!Number.isFinite(value)) throw new Error("invalid-number");
    metrics.push({ key, value, ...(unit && { unit }) });
  }
  if (input.averageDailyUsage.trim()) {
    metrics.push({
      key: "average_daily_usage",
      valueText: input.averageDailyUsage.trim(),
    });
  }
  await api.put(`/reports/${id}/metrics`, { metrics });
}

export function metricNumber(report: Report, key: string) {
  const metric = report.metrics.find((m) => m.key === key);
  if (!metric || metric.value === null) return null;
  return Number(metric.value);
}

export function metricText(report: Report, key: string) {
  return report.metrics.find((m) => m.key === key)?.valueText ?? null;
}
