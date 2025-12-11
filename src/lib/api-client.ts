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

export type ExpenseQuery = {
  page?: number;
  limit?: number;
  categoryId?: string;
  accountId?: string;
  period?: "today" | "week" | "month" | "year";
  startDate?: string;
  endDate?: string;
  tags?: string[];
  sort?: "date" | "updated";
  year?: number;
  month?: number;
};

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
function buildExpenseParams(params: ExpenseQuery = {}) {
  const query = new URLSearchParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  query.set("page", String(page));
  query.set("limit", String(limit));
  if (params.period) query.set("period", params.period);
  if (params.year) query.set("year", String(params.year));
  if (params.month) query.set("month", String(params.month));
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.accountId) query.set("accountId", params.accountId);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.tags?.length) query.set("tags", params.tags.join(","));
  if (params.sort) query.set("sort", params.sort);

  return query;
}

export async function getExpenses(
  params: ExpenseQuery | URLSearchParams = {},
): Promise<PaginatedResponse<Expense>> {
  const queryParams =
    params instanceof URLSearchParams ? params : buildExpenseParams(params);
  const query = queryParams.toString();
  return apiFetch(`/expenses${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function fetchAllExpenses(
  params: ExpenseQuery = {},
): Promise<Expense[]> {
  const limit = params.limit ?? 100;
  const base = { ...params, limit };
  let page = params.page ?? 1;

  const first = await getExpenses({ ...base, page });
  let items = [...(first.items ?? [])];
  const total = first.total ?? items.length;
  const totalPages = Math.max(
    1,
    Math.ceil(total / (first.pageSize || first.limit || limit)),
  );

  while (page < totalPages) {
    page += 1;
    const next = await getExpenses({ ...base, page });
    if (next?.items?.length) {
      items = items.concat(next.items);
    }
  }

  return items;
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
