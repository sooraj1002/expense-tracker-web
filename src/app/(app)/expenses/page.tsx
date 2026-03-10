"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAccounts,
  useCategories,
  useCreateExpense,
  useDeleteExpense,
  useExpenseTags,
  useExpenses,
  useUpdateExpense,
} from "@/hooks/use-queries";
import type { ExpenseQuery } from "@/lib/api-client";
import { downloadExpensesCsv } from "@/lib/export";
import type { Expense } from "@/lib/types";

const DEFAULT_TAG_LIMIT = 12;
const TODAY = new Date().toISOString().slice(0, 10);

export default function ExpensesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categoryId, setCategoryId] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [period, setPeriod] = useState("none");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [composerCategoryId, setComposerCategoryId] = useState("");
  const [composerAccountId, setComposerAccountId] = useState("");
  const [composerDate, setComposerDate] = useState(TODAY);
  const [composerTags, setComposerTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [composerError, setComposerError] = useState<string | null>(null);
  const [composerMessage, setComposerMessage] = useState<string | null>(null);

  const filterParams = useMemo<ExpenseQuery>(
    () => ({
      page,
      limit,
      categoryId: categoryId !== "all" ? categoryId : undefined,
      accountId: accountId !== "all" ? accountId : undefined,
      period: period !== "none" ? (period as ExpenseQuery["period"]) : undefined,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sort: "date",
    }),
    [accountId, categoryId, dateFrom, dateTo, limit, page, period, selectedTags],
  );

  const {
    items: expenses,
    isLoading,
    isFetching,
    isError,
    refetch,
    total,
    page: currentPage,
    pageSize: currentPageSize,
  } = useExpenses(filterParams);
  const { data: categoriesData } = useCategories();
  const { data: accountsData } = useAccounts();
  const { data: expenseTagsData } = useExpenseTags();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const accounts = useMemo(() => accountsData ?? [], [accountsData]);
  const expenseTags = useMemo(() => expenseTagsData ?? [], [expenseTagsData]);
  const editingExpense = useMemo(
    () => expenses.find((expense) => expense.id === editingExpenseId) ?? null,
    [editingExpenseId, expenses],
  );

  const effectivePageSize = currentPageSize || limit;
  const totalPages = Math.max(1, Math.ceil(total / (effectivePageSize || 1)));
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(total, currentPage * effectivePageSize);
  const visibleTagOptions = expenseTags.slice(0, DEFAULT_TAG_LIMIT);
  const isSavingExpense = createExpense.isPending || updateExpense.isPending;

  useEffect(() => {
    setPage(1);
  }, [accountId, categoryId, dateFrom, dateTo, limit, period, selectedTags]);

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    setEditingExpenseId(null);
    setAmount("");
    setDescription("");
    setComposerCategoryId(categories[0]?.id ?? "");
    setComposerAccountId(accounts[0]?.id ?? "");
    setComposerDate(TODAY);
    setComposerTags([]);
    setNewTagInput("");
    setComposerError(null);
    setComposerMessage(null);
    setIsComposerOpen(true);
    router.replace("/expenses", { scroll: false });
  }, [accounts, categories, router, searchParams]);

  useEffect(() => {
    if (composerAccountId || accounts.length === 0) return;
    setComposerAccountId(accounts[0]?.id ?? "");
  }, [accounts, composerAccountId]);

  useEffect(() => {
    if (composerCategoryId || categories.length === 0) return;
    setComposerCategoryId(categories[0]?.id ?? "");
  }, [categories, composerCategoryId]);

  async function handleExport() {
    setExportError(null);
    setComposerMessage(null);
    try {
      setExporting(true);
      await downloadExpensesCsv(
        { ...filterParams, page: 1, limit: 200 },
        "tracker-expenses.csv",
      );
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Unable to export right now.",
      );
    } finally {
      setExporting(false);
    }
  }

  function resetFilters() {
    setCategoryId("all");
    setAccountId("all");
    setSelectedTags([]);
    setPeriod("none");
    setDateFrom("");
    setDateTo("");
  }

  function resetComposer() {
    setEditingExpenseId(null);
    setAmount("");
    setDescription("");
    setComposerCategoryId(categories[0]?.id ?? "");
    setComposerAccountId(accounts[0]?.id ?? "");
    setComposerDate(TODAY);
    setComposerTags([]);
    setNewTagInput("");
    setComposerError(null);
  }

  function openCreateComposer() {
    resetComposer();
    setComposerMessage(null);
    setIsComposerOpen(true);
  }

  function openEditComposer(expense: Expense) {
    setEditingExpenseId(expense.id);
    setAmount(String(expense.amount ?? ""));
    setDescription(expense.description ?? "");
    setComposerCategoryId(expense.categoryId ?? categories[0]?.id ?? "");
    setComposerAccountId(expense.accountId ?? accounts[0]?.id ?? "");
    setComposerDate(formatDateInput(expense.date ?? expense.createdAt));
    setComposerTags(expense.tags ?? []);
    setNewTagInput("");
    setComposerError(null);
    setComposerMessage(null);
    setIsComposerOpen(true);
  }

  function closeComposer() {
    setIsComposerOpen(false);
    setComposerError(null);
    resetComposer();
  }

  function toggleFilterTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((entry) => entry !== tag)
        : [...current, tag],
    );
  }

  function toggleComposerTag(tag: string) {
    setComposerTags((current) =>
      current.includes(tag)
        ? current.filter((entry) => entry !== tag)
        : [...current, tag],
    );
    setNewTagInput("");
  }

  function addTypedTag() {
    const normalized = normalizeTag(newTagInput);
    if (!normalized) {
      setComposerError("Enter a tag before adding it.");
      return;
    }
    setComposerError(null);
    setComposerTags((current) =>
      current.includes(normalized) ? current : [...current, normalized],
    );
    setNewTagInput("");
  }

  async function handleSaveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComposerError(null);
    setComposerMessage(null);

    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setComposerError("Amount must be a valid positive number.");
      return;
    }
    if (!composerCategoryId) {
      setComposerError("Choose a category.");
      return;
    }
    if (!composerAccountId) {
      setComposerError("Choose an account.");
      return;
    }
    if (!composerDate) {
      setComposerError("Choose a date.");
      return;
    }

    try {
      const payload = {
        amount: parsedAmount,
        categoryId: composerCategoryId,
        accountId: composerAccountId,
        date: new Date(`${composerDate}T12:00:00`).toISOString(),
        description: description.trim() || undefined,
        tags: composerTags,
      };

      if (editingExpenseId) {
        await updateExpense.mutateAsync({
          id: editingExpenseId,
          payload: {
            ...payload,
            verified: editingExpense?.verified ?? true,
          },
        });
        setComposerMessage("Expense updated.");
      } else {
        await createExpense.mutateAsync(payload);
        setComposerMessage("Expense created.");
      }

      setIsComposerOpen(false);
      resetComposer();
    } catch (error) {
      setComposerError(
        error instanceof Error ? error.message : "Unable to save expense.",
      );
    }
  }

  async function handleDeleteExpense(expense: Expense) {
    const confirmed = window.confirm(
      `Delete ${expense.merchantName ?? expense.description ?? "this expense"}?`,
    );
    if (!confirmed) return;

    setComposerError(null);
    setComposerMessage(null);
    try {
      await deleteExpense.mutateAsync(expense.id);
      if (editingExpenseId === expense.id) {
        closeComposer();
      }
      setComposerMessage("Expense deleted.");
    } catch (error) {
      setComposerError(
        error instanceof Error ? error.message : "Unable to delete expense.",
      );
    }
  }

  async function handleToggleVerified(expense: Expense) {
    setComposerError(null);
    setComposerMessage(null);
    try {
      await updateExpense.mutateAsync({
        id: expense.id,
        payload: { verified: !expense.verified },
      });
      setComposerMessage(
        !expense.verified ? "Expense marked verified." : "Expense moved back to review.",
      );
    } catch (error) {
      setComposerError(
        error instanceof Error ? error.message : "Unable to update verification.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">
            Expenses
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Review & categorize
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Filter, verify, and manage entries from the Android parser or manual adds.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
          <Button size="sm" onClick={openCreateComposer}>
            Add expense
          </Button>
        </div>
      </div>

      {isComposerOpen ? (
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                {editingExpenseId ? "Edit expense" : "Manual entry"}
              </p>
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
                {editingExpenseId ? "Update expense details" : "Create a new expense"}
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Use the same account, category, date, and tag model as the mobile app.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={closeComposer}>
              Close
            </Button>
          </div>

          <form className="mt-5 grid gap-4 lg:grid-cols-2" onSubmit={handleSaveExpense}>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
              Amount
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="1499.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
              Date
              <Input
                type="date"
                value={composerDate}
                onChange={(event) => setComposerDate(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
              Category
              <select
                className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
                value={composerCategoryId}
                onChange={(event) => setComposerCategoryId(event.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
              Account
              <select
                className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
                value={composerAccountId}
                onChange={(event) => setComposerAccountId(event.target.value)}
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)] lg:col-span-2">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Lunch at Subway"
                rows={3}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)] shadow-[0_6px_30px_-24px_rgba(15,23,42,0.45)] outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
            </label>
            <div className="space-y-3 lg:col-span-2">
              <div className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
                <span>Tags</span>
                <div className="flex flex-wrap gap-2">
                  {composerTags.length === 0 ? (
                    <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-muted-foreground)]">
                      No tags selected. The backend will default to `misc`.
                    </span>
                  ) : (
                    composerTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleComposerTag(tag)}
                        className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-brand-strong)]"
                      >
                        #{tag} ×
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <Input
                  value={newTagInput}
                  onChange={(event) => setNewTagInput(event.target.value)}
                  placeholder="Add a tag like food or subway"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTypedTag}>
                  Add tag
                </Button>
              </div>
              {expenseTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {expenseTags.map((tag) => {
                    const active = composerTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleComposerTag(tag)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          active
                            ? "bg-[var(--color-brand)] text-white"
                            : "bg-[var(--color-muted)] text-[var(--color-foreground)]"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {composerError ? (
              <div className="rounded-2xl border border-[var(--color-negative)]/30 bg-[var(--color-negative)]/5 px-4 py-3 text-sm text-[var(--color-negative)] lg:col-span-2">
                {composerError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 lg:col-span-2">
              <Button type="submit" size="sm" disabled={isSavingExpense}>
                {isSavingExpense
                  ? "Saving…"
                  : editingExpenseId
                    ? "Save expense"
                    : "Create expense"}
              </Button>
              {editingExpense ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deleteExpense.isPending}
                  onClick={() => handleDeleteExpense(editingExpense)}
                >
                  {deleteExpense.isPending && deleteExpense.variables === editingExpense.id
                    ? "Deleting…"
                    : "Delete expense"}
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}

      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-muted)]/50 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Category
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Account
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            >
              <option value="all">All</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Period
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="none">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            From
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            To
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Page size
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            Filter by tags
          </p>
          <div className="flex flex-wrap gap-2">
            {expenseTags.length === 0 ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-muted-foreground)] ring-1 ring-[var(--color-border)]/70">
                No tags available yet
              </span>
            ) : (
              visibleTagOptions.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleFilterTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-[var(--color-brand)] text-white"
                        : "bg-white text-[var(--color-foreground)] ring-1 ring-[var(--color-border)]/70"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })
            )}
            {expenseTags.length > DEFAULT_TAG_LIMIT ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-muted-foreground)] ring-1 ring-[var(--color-border)]/70">
                +{expenseTags.length - DEFAULT_TAG_LIMIT} more tags
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-muted-foreground)] ring-1 ring-[var(--color-border)]/70">
            Showing {rangeStart}-{rangeEnd} of {total} •{" "}
            {isFetching ? "Refreshing…" : "Up to date"}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
            <Button variant="soft" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      {exportError ? (
        <div className="rounded-2xl border border-[var(--color-negative)]/30 bg-[var(--color-negative)]/5 px-4 py-3 text-sm text-[var(--color-negative)]">
          {exportError}
        </div>
      ) : null}

      {composerMessage ? (
        <div className="rounded-2xl border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5 px-4 py-3 text-sm text-[var(--color-brand-strong)]">
          {composerMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted-foreground)] shadow-sm">
          Loading expenses…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm shadow-sm">
          <div>
            <p className="font-semibold text-[var(--color-foreground)]">
              Unable to load expenses
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              Check your connection or auth; ensure backend URL is set.
            </p>
          </div>
          <Button size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/70 px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)]">
          No expenses match these filters. Add a manual entry or adjust filters.
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.9fr_1fr] gap-2 border-b border-[var(--color-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            <span>Merchant</span>
            <span>Category</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Date</span>
            <span className="text-right">Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.9fr_1fr] items-center gap-2 px-4 py-3 text-sm"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-[var(--color-foreground)]">
                    {expense.merchantName ?? expense.description ?? "Unknown"}
                  </div>
                  {expense.tags?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {expense.tags.map((tag) => (
                        <span
                          key={`${expense.id}-${tag}`}
                          className="rounded-full bg-[var(--color-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-muted-foreground)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="text-[var(--color-muted-foreground)]">
                  {expense.categoryName ?? "Uncategorized"}
                </div>
                <div className="text-right font-semibold text-[var(--color-foreground)]">
                  ₹{expense.amount?.toLocaleString?.("en-IN") ?? "--"}
                </div>
                <div className="text-right text-[var(--color-muted-foreground)]">
                  {expense.date ? new Date(expense.date).toLocaleDateString() : "-"}
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      expense.verified
                        ? "bg-[var(--color-brand)]/10 text-[var(--color-brand-strong)]"
                        : "bg-[var(--color-muted)] text-[var(--color-foreground)]"
                    }`}
                  >
                    {expense.verified ? "Verified" : expense.source ?? "Review"}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditComposer(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      updateExpense.isPending &&
                      updateExpense.variables?.id === expense.id
                    }
                    onClick={() => handleToggleVerified(expense)}
                  >
                    {expense.verified ? "Review" : "Verify"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--color-muted-foreground)]">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function normalizeTag(value: string) {
  return value.trim().toLowerCase();
}

function formatDateInput(value?: string) {
  if (!value) return TODAY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return TODAY;
  return date.toISOString().slice(0, 10);
}
