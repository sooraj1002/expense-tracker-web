"use client";

import Cookies from "js-cookie";

import type {
  Account,
  AuthResponse,
  Category,
  Expense,
  MerchantPattern,
  PaginatedResponse,
  User,
} from "./types";

const ACCESS_TOKEN_KEY = "tracker_access";
const REFRESH_TOKEN_KEY = "tracker_refresh";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function refreshToken(): Promise<boolean> {
  const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    credentials: "include",
  });

  if (!res.ok) {
    clearTokens();
    return false;
  }

  const data = (await res.json().catch(() => null)) as AuthResponse | null;
  if (!data?.token) return false;
  setTokens(data.token, data.refreshToken);
  return true;
}

async function handleResponse(res: Response) {
  const text = await res.text();
  if (!res.ok) {
    const message =
      (text ? safeParseError(text) : null) ??
      `Request failed (${res.status ?? "error"})`;
    throw new ApiError(message, res.status);
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function safeParseError(body: string): string | null {
  try {
    const data = JSON.parse(body);
    if (typeof data?.message === "string") return data.message;
  } catch {
    return null;
  }
  return null;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & {
    auth?: boolean;
    skipRefresh?: boolean;
  } = {},
  retrying = false,
): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = Cookies.get(ACCESS_TOKEN_KEY);
  if (init.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !retrying && init.auth !== false && !init.skipRefresh) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiFetch<T>(path, init, true);
    }
    clearTokens();
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  return handleResponse(res) as Promise<T>;
}

export function setTokens(token?: string, refreshToken?: string) {
  if (token) {
    Cookies.set(ACCESS_TOKEN_KEY, token);
  }
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

// Auth
export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    skipRefresh: true,
  });
  setTokens(data.token, data.refreshToken);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    skipRefresh: true,
  });
  setTokens(data.token, data.refreshToken);
  return data;
}

export async function me(): Promise<User> {
  return apiFetch<User>("/auth/me", { method: "GET" });
}

// Domain helpers (stubs for now)
export async function getExpenses(
  params: URLSearchParams,
): Promise<PaginatedResponse<Expense>> {
  const query = params.toString();
  return apiFetch(`/expenses${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function getAccounts(): Promise<Account[]> {
  return apiFetch("/accounts", { method: "GET" });
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch("/categories", { method: "GET" });
}

export async function getMerchantPatterns(): Promise<MerchantPattern[]> {
  return apiFetch("/merchant-patterns", { method: "GET" });
}
