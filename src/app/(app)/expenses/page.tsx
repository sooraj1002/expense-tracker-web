"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAccounts,
  useCategories,
  useExpenses,
} from "@/hooks/use-queries";
import type { ExpenseQuery } from "@/lib/api-client";
import { downloadExpensesCsv } from "@/lib/export";

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [source, setSource] = useState<"any" | "manual" | "auto">("any");
  const [verified, setVerified] = useState<"any" | "verified" | "unverified">(
    "any",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filterParams = useMemo<ExpenseQuery>(
    () => ({
      page,
      pageSize,
      search: search.trim() || undefined,
      categoryId: categoryId !== "all" ? categoryId : undefined,
      accountId: accountId !== "all" ? accountId : undefined,
      source: source === "any" ? undefined : source,
      verified:
        verified === "any" ? undefined : verified === "verified" ? true : false,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
      sort: "date_desc",
    }),
    [accountId, categoryId, dateFrom, dateTo, page, pageSize, search, source, verified],
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
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const effectivePageSize = currentPageSize || pageSize;
  const totalPages = Math.max(
    1,
    Math.ceil(total / (effectivePageSize || 1)),
  );
  const rangeStart =
    total === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(total, currentPage * effectivePageSize);

  useEffect(() => {
    setPage(1);
  }, [accountId, categoryId, dateFrom, dateTo, search, source, verified, pageSize]);

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      await downloadExpensesCsv(
        { ...filterParams, page: 1, pageSize: 200 },
        "tracker-expenses.csv",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to export right now.";
      setExportError(message);
    } finally {
      setExporting(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setCategoryId("all");
    setAccountId("all");
    setSource("any");
    setVerified("any");
    setDateFrom("");
    setDateTo("");
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
            Filter, search, and verify entries from the Android parser or manual
            adds.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
          <Button size="sm">Add expense</Button>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-muted)]/50 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Search
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Merchant or description"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Category
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="all">All</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Account
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="all">All</option>
              {accounts?.map((acct) => (
                <option key={acct.id} value={acct.id}>
                  {acct.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Status
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={verified}
              onChange={(e) =>
                setVerified(e.target.value as "any" | "verified" | "unverified")
              }
            >
              <option value="any">Any</option>
              <option value="verified">Verified</option>
              <option value="unverified">Needs review</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Source
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={source}
              onChange={(e) =>
                setSource(e.target.value as "any" | "manual" | "auto")
              }
            >
              <option value="any">Any</option>
              <option value="manual">Manual</option>
              <option value="auto">Auto</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            Page size
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </label>
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
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] gap-2 border-b border-[var(--color-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            <span>Merchant</span>
            <span>Category</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Date</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] items-center gap-2 px-4 py-3 text-sm"
              >
                <div className="font-semibold text-[var(--color-foreground)]">
                  {expense.merchantName ?? expense.description ?? "Unknown"}
                </div>
                <div className="text-[var(--color-muted-foreground)]">
                  {expense.categoryName ?? "Uncategorized"}
                </div>
                <div className="text-right font-semibold text-[var(--color-foreground)]">
                  ₹{expense.amount?.toLocaleString?.("en-IN") ?? "--"}
                </div>
                <div className="text-right text-[var(--color-muted-foreground)]">
                  {expense.createdAt
                    ? new Date(expense.createdAt).toLocaleDateString()
                    : "-"}
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
