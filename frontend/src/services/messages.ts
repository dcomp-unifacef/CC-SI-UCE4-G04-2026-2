import { api } from "./api";

export type MessageStatus =
  | "SCHEDULED"
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

export type MessageCategory =
  | "FILTER_WASH"
  | "FILTER_REPLACE_DISPOSABLE"
  | "FILTER_REPLACE_WASHABLE"
  | "ANNUAL_MAINTENANCE"
  | "MONTHLY_REPORT"
  | "CUSTOM";

export type Message = {
  id: string;
  category: MessageCategory;
  status: MessageStatus;
  contentSnapshot: string;
  scheduledAt: string | null;
  sentAt: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
  patient: { id: string; fullName: string; phone: string; status: string };
  template: { id: string; name: string } | null;
};

export type Template = {
  id: string;
  code: string;
  name: string;
  category: MessageCategory;
  body: string;
  mediaUrl: string | null;
};

export type TemplatePayload = {
  name: string;
  category: string;
  body: string;
  mediaUrl: string;
};

export type WhatsappStatus = {
  enabled: boolean;
  connected: boolean;
  state: string;
};

export type WhatsappQr = {
  base64?: string;
  code?: string;
  pairingCode?: string;
};

export type NewMessagePayload = {
  patientId: string;
  category: MessageCategory;
  reportId?: string;
  content: string;
};

export async function fetchMessages() {
  const { data } = await api.get<{ data: Message[] }>("/messages", {
    params: { pageSize: 100 },
  });
  return data.data;
}

export async function fetchMessage(id: string) {
  const { data } = await api.get<{ message: Message }>(`/messages/${id}`);
  return data.message;
}

export async function retryMessage(id: string) {
  await api.post(`/messages/${id}/retry`);
}

export async function createMessage(payload: NewMessagePayload) {
  const { data } = await api.post<{ message: { id: string } }>(
    "/messages",
    payload,
  );
  return data.message;
}

export async function fetchTemplate(id: string) {
  const { data } = await api.get<{ template: Template }>(`/message-templates/${id}`);
  return data.template;
}

export async function updateTemplate(id: string, payload: TemplatePayload) {
  await api.patch(`/message-templates/${id}`, payload);
}

export async function fetchWhatsappStatus() {
  const { data } = await api.get<WhatsappStatus>("/integrations/whatsapp/status");
  return data;
}

export async function createWhatsappQr() {
  const { data } = await api.post<WhatsappQr>("/integrations/whatsapp/connect");
  return data;
}
