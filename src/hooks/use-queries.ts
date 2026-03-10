import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAccount,
  createCategory,
  createExpense,
  deleteAccount,
  deleteCategory,
  deleteExpense,
  type ExpenseQuery,
  getAccounts,
  getCategories,
  getExpenseTags,
  getExpenses,
  updateAccount,
  updateCategory,
  updateExpense,
} from "@/lib/api-client";
import type {
  CreateAccountInput,
  CreateCategoryInput,
  CreateExpenseInput,
  Expense,
  UpdateAccountInput,
  UpdateCategoryInput,
  UpdateExpenseInput,
} from "@/lib/types";

export function useExpenses(params?: ExpenseQuery) {
  const query = useQuery({
    queryKey: ["expenses", params ?? {}],
    queryFn: () => getExpenses(params),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    items: query.data?.items ?? [],
    page: query.data?.page ?? params?.page ?? 1,
    pageSize: query.data?.pageSize ?? query.data?.limit ?? params?.limit ?? 20,
    total: query.data?.total ?? 0,
  };
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

export function useExpenseTags() {
  return useQuery({
    queryKey: ["expense-tags"],
    queryFn: getExpenseTags,
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

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryInput) => createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryInput;
    }) => updateCategory(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountInput) => createAccount(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAccountInput;
    }) => updateAccount(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpenseInput) => createExpense(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["expense-tags"] });
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpenseInput;
    }) => updateExpense(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["expense-tags"] });
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["expense-tags"] });
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
