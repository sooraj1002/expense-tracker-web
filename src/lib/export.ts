"use client";

import { fetchAllExpenses, type ExpenseQuery } from "./api-client";
import type { Expense } from "./types";

export async function downloadExpensesCsv(
  params?: ExpenseQuery,
  filename = "expenses.csv",
) {
  const expenses = await fetchAllExpenses(params ?? {});
  const csv = expensesToCsv(expenses);
  triggerDownload(csv, filename);
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
    formatDate(expense.createdAt),
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

function triggerDownload(content: string, filename: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
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
