import axios, { isAxiosError, type InternalAxiosRequestConfig } from "axios";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  expiresIn: string;
};

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = axios.create({ baseURL, withCredentials: true });

let accessToken: string | null = null;
let refreshing: Promise<AuthResponse> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function refreshSession(): Promise<AuthResponse> {
  refreshing ??= axios
    .post<AuthResponse>(`${baseURL}/auth/refresh`, null, {
      withCredentials: true,
    })
    .then(({ data }) => {
      setAccessToken(data.accessToken);
      return data;
    })
    .catch((error: unknown) => {
      setAccessToken(null);
      throw error;
    })
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) throw error;

    const config: RetriableConfig = error.config;
    const isAuthRoute = config.url?.startsWith("/auth/") ?? false;

    if (error.response?.status !== 401 || config.retried || isAuthRoute) {
      throw error;
    }

    config.retried = true;

    try {
      await refreshSession();
    } catch {
      window.dispatchEvent(new Event("auth:expired"));
      throw error;
    }

    return api(config);
  },
);

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  if (!error.response) return "Não foi possível conectar ao servidor.";

  const { status } = error.response;

  if (status === 429) return "Muitas tentativas. Tente novamente mais tarde.";
  if (status === 400) return "Dados inválidos. Verifique os campos e tente novamente.";
  if (status >= 500) return "Erro no servidor. Tente novamente em instantes.";

  return fallback;
}
