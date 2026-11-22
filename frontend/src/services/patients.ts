import { api } from "./api";

export type PatientStatus = "ACTIVE" | "PAUSED" | "INACTIVE";
export type FilterType = "WASHABLE" | "DISPOSABLE" | "UNKNOWN";
export type ReportPlatform =
  | "AIRVIEW"
  | "CARE_ORCHESTRATOR"
  | "SMART_LIVE"
  | "MANUAL";

export type CpapModel = {
  id: string;
  manufacturer: string;
  model: string;
  filterType: FilterType;
};

export type Patient = {
  id: string;
  fullName: string;
  phone: string;
  birthDate: string | null;
  age: number | null;
  therapyStartDate: string | null;
  cpf: string | null;
  cep: string | null;
  email: string | null;
  cpapSerialNumber: string | null;
  cpapModelId: string | null;
  cpapModelName: string | null;
  filterType: FilterType | null;
  physicianName: string | null;
  maskModel: string | null;
  reportPlatform: ReportPlatform | null;
  status: PatientStatus;
  whatsappOptIn: boolean;
};

export type PatientDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type PatientMessage = {
  id: string;
  category: string;
  status: string;
  scheduledAt: string | null;
};

export type PatientAuditEvent = {
  id: string;
  entityType: string;
  action: string;
  createdAt: string;
};

export type PatientDetails = Patient & {
  documents: PatientDocument[];
  messages: PatientMessage[];
  auditEvents: PatientAuditEvent[];
};

export type PatientListParams = {
  page: number;
  pageSize: number;
  search: string;
  status: PatientStatus | "";
  cpapModelId: string;
};

export type PatientPayload = {
  fullName: string;
  phone: string;
  birthDate: string;
  therapyStartDate: string;
  cpf: string;
  cep: string;
  email: string;
  cpapSerialNumber: string;
  cpapModelId: string;
  filterType: string;
  physicianName: string;
  maskModel: string;
  reportPlatform: string;
};

export async function fetchPatients(params: PatientListParams) {
  const { data } = await api.get<{
    data: Patient[];
    pagination: { total: number };
  }>("/patients", {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      status: params.status || "ALL",
      ...(params.search && { search: params.search }),
      ...(params.cpapModelId && { cpapModelId: params.cpapModelId }),
    },
  });
  return { patients: data.data, total: data.pagination.total };
}

export async function fetchPatient(id: string) {
  const { data } = await api.get<{ patient: PatientDetails }>(
    `/patients/${id}`,
  );
  return data.patient;
}

export async function createPatient(payload: PatientPayload) {
  const { data } = await api.post<{ patient: Patient }>("/patients", payload);
  return data.patient;
}

export async function updatePatient(id: string, payload: PatientPayload) {
  const { data } = await api.patch<{ patient: Patient }>(
    `/patients/${id}`,
    payload,
  );
  return data.patient;
}

export async function deactivatePatient(id: string) {
  await api.delete(`/patients/${id}`);
}

export async function fetchCpapModels() {
  const { data } = await api.get<{ data: CpapModel[] }>("/cpap-models", {
    params: { isActive: true, pageSize: 100 },
  });
  return data.data;
}

export async function uploadDocument(patientId: string, file: File) {
  const body = new FormData();
  body.append("type", "POLYSOMNOGRAPHY");
  body.append("file", file);
  await api.post(`/patients/${patientId}/documents`, body);
}

export async function openDocument(patientId: string, documentId: string) {
  const { data } = await api.get<Blob>(
    `/patients/${patientId}/documents/${documentId}/file`,
    { responseType: "blob" },
  );
  const url = URL.createObjectURL(data);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
