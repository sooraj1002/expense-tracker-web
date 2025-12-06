import { Button } from "@/components/ui/button";
import {
  useAccounts,
  useCategories,
  useExpenseStats,
  useExpenses,
} from "@/hooks/use-queries";

export default function DashboardPage() {
  const { data: expenseData, isLoading: loadingExpenses, refetch: refetchExpenses } =
    useExpenses();
  const { data: accountsData, isLoading: loadingAccounts } = useAccounts();
  const { data: categoriesData, isLoading: loadingCategories } = useCategories();

  const expenses = expenseData ?? [];
  const stats = useExpenseStats(expenses);
  const reviewQueue = expenses.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">
            Overview
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Control center
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Monitor spend, review new transactions, and keep categories tidy.
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--color-muted)]/80 px-4 py-3 text-sm text-[var(--color-muted-foreground)] ring-1 ring-[var(--color-border)]/80">
          Sync: connected · Tokens refresh automatically
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-muted)]/40 p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            This month
          </p>
          <p className="text-2xl font-semibold text-[var(--color-foreground)]">
            ₹{stats.total.toLocaleString("en-IN")}
          </p>
          <p className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Total spend (all sources)
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-muted)]/40 p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            Verified
          </p>
          <p className="text-2xl font-semibold text-[var(--color-foreground)]">
            {stats.verified}
          </p>
          <p className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Marked as confirmed
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-muted)]/40 p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            Auto-applied
          </p>
          <p className="text-2xl font-semibold text-[var(--color-foreground)]">
            {stats.auto}
          </p>
          <p className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Categorized by patterns
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-muted)]/40 p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            Accounts
          </p>
          <p className="text-2xl font-semibold text-[var(--color-foreground)]">
            {accountsData?.length ?? 0}
          </p>
          <p className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Connected sources
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                Review queue
              </p>
              <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                Recent transactions
              </h2>
            </div>
            <Button
              className="text-sm font-semibold"
              variant="ghost"
              onClick={() => refetchExpenses()}
            >
              Refresh
            </Button>
          </div>
          {loadingExpenses ? (
            <div className="rounded-2xl bg-[var(--color-muted)]/60 px-3 py-3 text-sm text-[var(--color-muted-foreground)]">
              Loading expenses…
            </div>
          ) : reviewQueue.length === 0 ? (
            <div className="rounded-2xl bg-[var(--color-muted)]/60 px-3 py-3 text-sm text-[var(--color-muted-foreground)]">
              No recent transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {reviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-[var(--color-foreground)]">
                      {item.merchantName ?? item.description ?? "Unknown"}
                    </span>
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      {item.categoryName ?? "Uncategorized"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-[var(--color-foreground)]">
                      ₹{item.amount?.toLocaleString?.("en-IN") ?? "--"}
                    </p>
                    <p className="text-xs font-semibold text-[var(--color-brand)]">
                      {item.verified ? "Verified" : item.source ?? "Review"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            Signals
          </p>
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
            Quick insights
          </h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/60 px-3 py-3">
              <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                Categories
              </p>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">
                {loadingCategories
                  ? "Loading…"
                  : `${categoriesData?.length ?? 0} defined`}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/60 px-3 py-3">
              <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                Accounts
              </p>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">
                {loadingAccounts
                  ? "Loading…"
                  : `${accountsData?.length ?? 0} sources`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="flex flex-col gap-1 pb-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
              Reporting
            </p>
            <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
              Month-to-date pulse
            </h2>
          </div>
          <div className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-muted-foreground)]">
            CSV export ready
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-strong)] p-4 text-white shadow-lg shadow-[var(--color-brand)]/25">
            <p className="text-sm font-semibold">Burn rate</p>
            <p className="text-2xl font-semibold">₹1,406 / day</p>
            <p className="text-xs font-medium opacity-80">
              Track against monthly allowance
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/70 p-4">
            <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
              Category spread
            </p>
            <p className="text-lg font-semibold text-[var(--color-foreground)]">
              Food, Transport, Shopping
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Visual breakdown coming next
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/70 p-4">
            <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
              Upcoming
            </p>
            <p className="text-lg font-semibold text-[var(--color-foreground)]">
              Insights & export routines
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Stay tuned for charts + CSV
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
