import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/use-queries";

export default function AccountsPage() {
  const { data, isLoading, isError, refetch } = useAccounts();
  const accounts = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">
            Accounts
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Balances & sources
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Manage bank sources used by the Android parser and manual entries.
          </p>
        </div>
        <Button size="sm">Add account</Button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted-foreground)] shadow-sm">
          Loading accounts…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm shadow-sm">
          <div>
            <p className="font-semibold text-[var(--color-foreground)]">
              Unable to load accounts
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              Check your connection or auth; ensure backend URL is set.
            </p>
          </div>
          <Button size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/70 px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)]">
          No accounts yet. Add one to map notifications and manual entries.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
                {account.name}
              </p>
              <p className="text-2xl font-semibold text-[var(--color-foreground)]">
                ₹{account.currentBalance?.toLocaleString?.("en-IN") ?? "--"}
              </p>
              <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
                <span>
                  Total spent: ₹{account.totalSpent?.toLocaleString?.("en-IN") ?? 0}
                </span>
                <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]">
                  In sync
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
