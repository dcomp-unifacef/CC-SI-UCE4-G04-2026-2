import { api, type User } from "./api";
import type { FilterType, ReportPlatform } from "./patients";

export type Settings = {
  timezone: string;
  sendingWindowStart: string;
  sendingWindowEnd: string;
  messageAutomationEnabled: boolean;
  reportAutomationEnabled: boolean;
};

export type Portal = {
  platform: Exclude<ReportPlatform, "MANUAL">;
  isEnabled: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
};

export async function fetchSettings() {
  const { data } = await api.get<{ settings: Settings }>("/settings");
  return data.settings;
}

export async function updateSettings(payload: Partial<Settings>) {
  const { data } = await api.patch<{ settings: Settings }>("/settings", payload);
  return data.settings;
}

export async function fetchPortals() {
  const { data } = await api.get<{ portals: Portal[] }>("/settings/portals");
  return data.portals;
}

export async function updatePortal(platform: string, isEnabled: boolean) {
  await api.patch(`/settings/portals/${platform}`, { isEnabled });
}

export async function updateProfile(payload: { name: string; email: string }) {
  const { data } = await api.patch<{ user: User }>("/users/me", payload);
  return data.user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  await api.patch("/auth/password", { currentPassword, newPassword });
}

export async function createCpapModel(payload: {
  manufacturer: string;
  model: string;
  filterType: FilterType;
}) {
  await api.post("/cpap-models", payload);
}
