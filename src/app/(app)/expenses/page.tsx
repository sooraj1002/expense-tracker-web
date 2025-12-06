import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/use-queries";

export default function ExpensesPage() {
  const { data, isLoading, isError, refetch } = useExpenses();
  const expenses = data ?? [];

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
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button size="sm">Add expense</Button>
        </div>
      </div>

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
          No expenses yet. Add a manual entry or sync from Android.
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
                  <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]">
                    {expense.verified ? "Verified" : expense.source ?? "Review"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
