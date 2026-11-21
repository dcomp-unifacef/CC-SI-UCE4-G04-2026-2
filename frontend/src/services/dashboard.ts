import { api } from "./api";

export type ActivityResponse = {
  id: string;
  type: string;
  title: string;
  status: string;
  patient: { id: string; fullName: string } | null;
  occurredAt: string;
};

export type SummaryResponse = {
  patientsActive: number;
  messagesScheduledToday: number;
  messagesSentToday: number;
  messagesFailedToday: number;
  reportsPending: number;
  reportsProcessed: number;
  reportsFailed: number;
  automation: { messagesEnabled: boolean; reportsEnabled: boolean };
  activity: ActivityResponse[];
};

export type ReminderResponse = {
  id: string;
  category: string;
  scheduledAt: string | null;
  patient: { id: string; fullName: string };
};

export async function fetchSummary() {
  const { data } = await api.get<SummaryResponse>("/dashboard/summary");
  return data;
}

export async function fetchUpcomingReminders() {
  const { data } = await api.get<{ data: ReminderResponse[] }>("/messages", {
    params: { status: "SCHEDULED", pageSize: 5 },
  });
  return data.data;
}
