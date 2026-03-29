"use client";

import Cookies from "js-cookie";

import type {
  Account,
  ApiEnvelope,
  AuthResponse,
  Category,
  CreateAccountInput,
  CreateCategoryInput,
  CreateExpenseInput,
  Expense,
  PaginatedResponse,
  UpdateAccountInput,
  UpdateCategoryInput,
  UpdateExpenseInput,
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function refreshToken(): Promise<boolean> {
  const tokenForRefresh =
    Cookies.get(REFRESH_TOKEN_KEY) ?? Cookies.get(ACCESS_TOKEN_KEY);
  if (!tokenForRefresh) return false;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: tokenForRefresh }),
    credentials: "include",
  });

  if (!res.ok) {
    clearTokens();
    return false;
  }

  const response = (await res.json().catch(() => null)) as
    | ApiEnvelope<{ token: string; refreshToken?: string }>
    | null;
  const data = response?.success ? response.data : null;
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
    if (typeof data?.error?.message === "string") return data.error.message;
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
  const refreshValue = refreshToken ?? token;
  if (refreshValue) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshValue);
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
  const response = await apiFetch<ApiEnvelope<AuthResponse>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    skipRefresh: true,
  });
  const data = unwrapData(response);
  setTokens(data.token, data.refreshToken);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> {
  const response = await apiFetch<ApiEnvelope<AuthResponse>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    skipRefresh: true,
  });
  const data = unwrapData(response);
  setTokens(data.token, data.refreshToken);
  return data;
}

export async function me(): Promise<User> {
  const response = await apiFetch<ApiEnvelope<User>>("/auth/me", { method: "GET" });
  return unwrapData(response);
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
  const response = await apiFetch<{
    success: boolean;
    data: Expense[];
    pagination?: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      totalAmount: number;
    };
    error?: { message?: string } | null;
  }>(`/expenses${query ? `?${query}` : ""}`, { method: "GET" });

  if (!response.success) {
    throw new ApiError(
      response.error?.message ?? "Unable to load expenses.",
    );
  }

  const items = (response.data ?? []).map(normalizeExpense);
  const pagination = response.pagination;
  return {
    items,
    page: pagination?.page ?? 1,
    pageSize: pagination?.limit ?? 20,
    limit: pagination?.limit ?? 20,
    total: pagination?.totalCount ?? items.length,
    totalPages: pagination?.totalPages ?? 1,
    totalAmount:
      pagination?.totalAmount ??
      items.reduce((sum, expense) => sum + Math.abs(expense.amount ?? 0), 0),
  };
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
  const response = await apiFetch<ApiEnvelope<Account[]>>("/accounts", {
    method: "GET",
  });
  return unwrapData(response);
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiFetch<ApiEnvelope<Category[]>>("/categories", {
    method: "GET",
  });
  return unwrapData(response);
}

export async function getExpenseTags(): Promise<string[]> {
  const response = await apiFetch<ApiEnvelope<{ tags: string[]; count: number }>>(
    "/expenses/tags",
    { method: "GET" },
  );
  return unwrapData(response).tags ?? [];
}

export async function createCategory(
  payload: CreateCategoryInput,
): Promise<Category> {
  const response = await apiFetch<ApiEnvelope<Category>>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return unwrapData(response);
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryInput,
): Promise<Category> {
  const response = await apiFetch<ApiEnvelope<Category>>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return unwrapData(response);
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await apiFetch<ApiEnvelope<null>>(`/categories/${id}`, {
    method: "DELETE",
  });
  unwrapData(response);
}

export async function createAccount(payload: CreateAccountInput): Promise<Account> {
  const response = await apiFetch<ApiEnvelope<Account>>("/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return unwrapData(response);
}

export async function updateAccount(
  id: string,
  payload: UpdateAccountInput,
): Promise<Account> {
  const response = await apiFetch<ApiEnvelope<Account>>(`/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return unwrapData(response);
}

export async function deleteAccount(id: string): Promise<void> {
  const response = await apiFetch<ApiEnvelope<null>>(`/accounts/${id}`, {
    method: "DELETE",
  });
  unwrapData(response);
}

export async function createExpense(
  payload: CreateExpenseInput,
): Promise<Expense> {
  const response = await apiFetch<ApiEnvelope<Expense>>("/expenses", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      tags: normalizeTags(payload.tags ?? []),
    }),
  });
  return normalizeExpense(unwrapData(response));
}

export async function updateExpense(
  id: string,
  payload: UpdateExpenseInput,
): Promise<Expense> {
  const response = await apiFetch<ApiEnvelope<Expense>>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      tags: payload.tags ? normalizeTags(payload.tags) : undefined,
    }),
  });
  return normalizeExpense(unwrapData(response));
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await apiFetch<ApiEnvelope<null>>(`/expenses/${id}`, {
    method: "DELETE",
  });
  unwrapData(response);
}

function unwrapData<T>(response: ApiEnvelope<T>) {
  if (!response.success) {
    throw new ApiError(response.error?.message ?? "Request failed.");
  }
  return response.data;
}

function normalizeExpense(expense: Expense): Expense {
  const tags = normalizeTags(expense.tags ?? []);
  return {
    ...expense,
    categoryId: expense.category?.categoryId ?? expense.categoryId,
    categoryName: expense.category?.categoryName ?? expense.categoryName,
    tags: tags.length > 0 ? tags : ["misc"],
  };
}

function normalizeTags(tags: string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];
  tags.forEach((tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    normalized.push(trimmed);
  });
  return normalized;
}
