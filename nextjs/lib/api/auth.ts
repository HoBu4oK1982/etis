import { apiFetch } from "./client";

/**
 * Клиентский слой auth: login / register / logout / me.
 * Все ходы напрямую в Laravel Sanctum (POST /api/v1/auth/*).
 *
 * Токен храним в localStorage — на этапе Livewire-миграции нам важнее
 * реактивность шапки и совместимость с CSR-компонентами, чем максимально
 * жёсткий XSS-щит. Когда всё переедет за httpOnly cookie через Next.js
 * route-handlers — переключим здесь и в проверках, публичный API этого
 * модуля меняться не будет.
 */

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
};

export type AuthPayload = {
  user: AuthUser;
  access_token: string;
  token_type: "Bearer";
  expires_in: number; // секунды
};

export type AuthResponse = {
  data: AuthPayload;
};

export type ValidationErrors = Record<string, string[]>;

export class AuthError extends Error {
  constructor(message: string, public status: number, public errors?: ValidationErrors) {
    super(message);
    this.name = "AuthError";
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  try {
    return await apiFetch<T>(path, { method: "POST", body, noStore: true });
  } catch (err) {
    // apiFetch бросает ApiError с status и body
    const e = err as { status?: number; body?: unknown; message?: string };
    const b = (e.body ?? {}) as { message?: string; errors?: ValidationErrors };
    throw new AuthError(
      b.message || e.message || "Ошибка запроса",
      e.status ?? 0,
      b.errors
    );
  }
}

export function loginUser(input: { email: string; password: string }) {
  return post<AuthResponse>("auth/login", input);
}

export function registerUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}) {
  return post<AuthResponse>("auth/register", input);
}

export function logoutUser(token: string) {
  return apiFetch<{ ok: true }>("auth/logout", {
    method: "POST",
    token,
    noStore: true,
  });
}

/* ---------- Локальное хранение ---------- */

const TOKEN_KEY = "etis-access-token";
const USER_KEY = "etis-auth-user";
const EXPIRES_KEY = "etis-auth-expires";

export function saveAuth(payload: AuthPayload) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, payload.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + payload.expires_in * 1000));
  window.dispatchEvent(new Event("etis:auth"));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  window.dispatchEvent(new Event("etis:auth"));
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const expires = Number(localStorage.getItem(EXPIRES_KEY) || 0);
  if (!token || !expires || Date.now() >= expires) {
    return null;
  }
  return token;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function updateStoredUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("etis:auth"));
}
