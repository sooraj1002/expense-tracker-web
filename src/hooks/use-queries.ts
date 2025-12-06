import { useQuery } from "@tanstack/react-query";

import {
  getAccounts,
  getCategories,
  getExpenses,
  getMerchantPatterns,
} from "@/lib/api-client";
import type { Expense } from "@/lib/types";

export function useExpenses(params?: URLSearchParams) {
  return useQuery({
    queryKey: ["expenses", params?.toString() ?? "all"],
    queryFn: () => getExpenses(params ?? new URLSearchParams()),
    select: (data) => data.items,
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function usePatterns() {
  return useQuery({
    queryKey: ["patterns"],
    queryFn: getMerchantPatterns,
  });
}

export function useExpenseStats(expenses?: Expense[]) {
  if (!expenses || expenses.length === 0) {
    return { total: 0, verified: 0, auto: 0 };
  }
  const total = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const verified = expenses.filter((e) => e.verified).length;
  const auto = expenses.filter((e) => e.source === "auto").length;
  return { total, verified, auto };
}
