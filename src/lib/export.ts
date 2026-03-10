"use client";

import Cookies from "js-cookie";

import { type ExpenseQuery } from "./api-client";
import type { Expense } from "./types";

export async function downloadExpensesCsv(
  params?: ExpenseQuery,
  filename = "expenses.csv",
) {
  const token = Cookies.get("tracker_access");
  const res = await fetch(buildExportUrl(params), {
    credentials: "include",
    headers: {
      Accept: "text/csv",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Export failed (${res.status})`);
  }
  const blob = await res.blob();
  triggerDownloadBlob(blob, filename);
}

export function expensesToCsv(expenses: Expense[]) {
  const headers = [
    "Date",
    "Merchant/Description",
    "Category",
    "Account",
    "Amount",
    "Source",
    "Verified",
    "Notes",
  ];

  const rows = expenses.map((expense) => [
    formatDate(expense.date || expense.createdAt),
    expense.merchantName ?? expense.description ?? "",
    expense.categoryName ?? "Uncategorized",
    expense.accountName ?? "",
    typeof expense.amount === "number" ? expense.amount.toFixed(2) : "",
    expense.source ?? "",
    expense.verified ? "yes" : "no",
    expense.description ?? "",
  ]);

  const serialized = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
  return serialized;
}

function escapeCsv(value: string | number | boolean | null | undefined) {
  const str = value === null || value === undefined ? "" : String(value);
  const needsQuotes = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function formatDate(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function triggerDownloadBlob(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildExportUrl(params?: ExpenseQuery) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.period) query.set("period", params.period);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.accountId) query.set("accountId", params.accountId);
  if (params?.tags?.length) query.set("tags", params.tags.join(","));
  if (params?.year) query.set("year", String(params.year));
  if (params?.month) query.set("month", String(params.month));
  if (params?.sort) query.set("sort", params.sort);
  const qs = query.toString();
  return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://shadywrldserver:8082/api"}/expenses/export${qs ? `?${qs}` : ""}`;
}
