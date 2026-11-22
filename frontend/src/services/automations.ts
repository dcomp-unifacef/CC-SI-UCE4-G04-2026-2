import { api } from "./api";

export type JobType =
  | "MESSAGE_SEND"
  | "REPORT_IMPORT"
  | "REPORT_PROCESS"
  | "REPORT_SEND"
  | "PORTAL_SYNC";

export type JobStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type Job = {
  id: string;
  type: JobType;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  patient: { id: string; fullName: string } | null;
  report: { id: string; originalName: string; platform: string } | null;
};

export async function fetchJobs(pageSize: number) {
  const { data } = await api.get<{ data: Job[] }>("/automation-jobs", {
    params: { pageSize },
  });
  return data.data;
}

export async function fetchJob(id: string) {
  const { data } = await api.get<{ job: Job }>(`/automation-jobs/${id}`);
  return data.job;
}

export async function retryJob(id: string) {
  await api.post(`/automation-jobs/${id}/retry`);
}

export async function fetchScheduledMessages() {
  const { data } = await api.get<{
    data: { scheduledAt: string | null }[];
    pagination: { total: number };
  }>("/messages", { params: { status: "SCHEDULED", pageSize: 1 } });
  return {
    next: data.data[0]?.scheduledAt ?? null,
    total: data.pagination.total,
  };
}
