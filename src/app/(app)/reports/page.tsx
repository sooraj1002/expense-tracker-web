"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useExpenseStats, useExpenses } from "@/hooks/use-queries";
import { downloadExpensesCsv } from "@/lib/export";
import type { Expense } from "@/lib/types";

const ranges = [
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 180 days", value: 180 },
];

export default function ReportsPage() {
  const [rangeDays, setRangeDays] = useState(90);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (rangeDays - 1));
    return {
      start: formatDateOnly(start),
      end: formatDateOnly(end),
    };
  }, [rangeDays]);

  const params = useMemo(
    () => ({
      page: 1,
      pageSize: 400,
      startDate: dateRange.start,
      endDate: dateRange.end,
      sort: "date_desc" as const,
    }),
    [dateRange.end, dateRange.start],
  );

  const {
    items: expenses,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useExpenses(params);
  const stats = useExpenseStats(expenses);

  const daysSpan = Math.max(1, rangeDays);
  const averagePerDay = stats.total / daysSpan;
  const verifiedRate = expenses.length
    ? Math.round((expenses.filter((e) => e.verified).length / expenses.length) * 100)
    : 0;
  const timeline = useMemo(() => buildTimeline(expenses), [expenses]);
  const categories = useMemo(() => buildCategories(expenses), [expenses]);
  const merchants = useMemo(() => buildMerchants(expenses), [expenses]);
  const chartWindow = timeline.slice(-24);
  const maxTrend = Math.max(...chartWindow.map((t) => t.total), 1);
  const maxCategory = Math.max(...categories.map((c) => c.total), 1);

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      await downloadExpensesCsv(params, `tracker-report-${rangeDays}d.csv`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to export right now.";
      setExportError(message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">
            Reports
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Visuals & exports
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Track spend over time, slice by category, and export CSVs with the
            applied filters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-foreground)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]/60"
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
          >
            {ranges.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="soft" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total spend" value={`₹${stats.total.toLocaleString("en-IN")}`} />
        <StatCard
          label="Avg. per day"
          value={`₹${averagePerDay.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          hint={`${daysSpan} day window`}
        />
        <StatCard label="Verified" value={`${stats.verified}`} hint={`${verifiedRate}% of entries`} />
        <StatCard label="Auto-applied" value={`${stats.auto}`} hint="Pattern matched" />
      </div>

      {exportError ? (
        <div className="rounded-2xl border border-[var(--color-negative)]/30 bg-[var(--color-negative)]/5 px-4 py-3 text-sm text-[var(--color-negative)]">
          {exportError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted-foreground)] shadow-sm">
          Loading report data…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm shadow-sm">
          <div>
            <p className="font-semibold text-[var(--color-foreground)]">
              Unable to load report data
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              Check your connection or refresh tokens and try again.
            </p>
          </div>
          <Button size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/70 px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)]">
          No expenses in this range. Adjust the window or sync data.
        </div>
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                    Trend
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    Burn over time
                  </h2>
                </div>
                <div className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-muted-foreground)]">
                  {isFetching ? "Refreshing…" : "Live"}
                </div>
              </div>
              <div className="mt-4 h-40 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand)]/5 to-[var(--color-brand)]/10 p-3">
                <div className="flex h-full items-end gap-1">
                  {chartWindow.map((point) => (
                    <div key={point.label} className="flex flex-col items-center gap-1">
                      <div
                        className="w-3 rounded-full bg-[var(--color-brand)] shadow-sm shadow-[var(--color-brand)]/20"
                        style={{
                          height: `${Math.max(8, Math.round((point.total / maxTrend) * 100))}%`,
                        }}
                        title={`${point.label}: ₹${point.total.toLocaleString("en-IN")}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  Showing last {chartWindow.length} days from {dateRange.start} to {dateRange.end}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                Category mix
              </p>
              <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                Top spend buckets
              </h2>
              <div className="mt-4 space-y-3">
                {categories.slice(0, 6).map((category) => {
                  const width = Math.max(6, Math.round((category.total / maxCategory) * 100));
                  return (
                    <div key={category.name}>
                      <div className="flex items-center justify-between text-sm font-semibold text-[var(--color-foreground)]">
                        <span>{category.name}</span>
                        <span className="text-[var(--color-muted-foreground)]">
                          ₹{category.total.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-muted)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-brand)]"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                    Merchants
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                    Biggest spends
                  </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting}>
                  {exporting ? "Exporting…" : "Export CSV"}
                </Button>
              </div>
              <div className="mt-3 divide-y divide-[var(--color-border)]">
                {merchants.slice(0, 6).map((merchant) => (
                  <div
                    key={merchant.name}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--color-foreground)]">
                        {merchant.name}
                      </span>
                      <span className="text-[var(--color-muted-foreground)]">
                        {merchant.count} transactions
                      </span>
                    </div>
                    <span className="text-base font-semibold text-[var(--color-foreground)]">
                      ₹{merchant.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                Data window
              </p>
              <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                Applied filters
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-[var(--color-muted)]/60 px-3 py-2">
                  <span className="font-semibold text-[var(--color-muted-foreground)]">
                    Range
                  </span>
                  <span className="text-[var(--color-foreground)]">
                    {dateRange.start} → {dateRange.end}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[var(--color-muted)]/60 px-3 py-2">
                  <span className="font-semibold text-[var(--color-muted-foreground)]">
                    Entries
                  </span>
                  <span className="text-[var(--color-foreground)]">
                    {expenses.length} loaded
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[var(--color-muted)]/60 px-3 py-2">
                  <span className="font-semibold text-[var(--color-muted-foreground)]">
                    Status
                  </span>
                  <span className="text-[var(--color-foreground)]">
                    {isFetching ? "Refreshing" : "Ready"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatDateOnly(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function buildTimeline(expenses: Expense[]) {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => {
    const key = formatDateOnly(expense.createdAt ?? "");
    if (!key) return;
    const amount = Math.abs(expense.amount ?? 0);
    totals.set(key, (totals.get(key) ?? 0) + amount);
  });
  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, total]) => ({ label, total }));
}

function buildCategories(expenses: Expense[]) {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => {
    const key = expense.categoryName ?? "Uncategorized";
    const amount = Math.abs(expense.amount ?? 0);
    totals.set(key, (totals.get(key) ?? 0) + amount);
  });

  return Array.from(totals.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

function buildMerchants(expenses: Expense[]) {
  const totals = new Map<string, { total: number; count: number }>();
  expenses.forEach((expense) => {
    const key = expense.merchantName ?? expense.description ?? "Unknown";
    const amount = Math.abs(expense.amount ?? 0);
    const entry = totals.get(key) ?? { total: 0, count: 0 };
    entry.total += amount;
    entry.count += 1;
    totals.set(key, entry);
  });

  return Array.from(totals.entries())
    .map(([name, info]) => ({ name, total: info.total, count: info.count }))
    .sort((a, b) => b.total - a.total);
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-muted)]/40 p-4 shadow-sm">
      <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[var(--color-foreground)]">{value}</p>
      {hint ? (
        <p className="text-xs font-medium text-[var(--color-muted-foreground)]">{hint}</p>
      ) : null}
    </div>
  );
}
