import { Button } from "@/components/ui/button";

const accounts = [
  { name: "HDFC Savings", balance: "₹62,400", change: "+₹1,200", status: "In sync" },
  { name: "ICICI Credit", balance: "-₹14,800", change: "-₹2,400", status: "Payment due" },
  { name: "Cash", balance: "₹3,200", change: "Manual", status: "Manual" },
];

export default function AccountsPage() {
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

      <div className="grid gap-3 md:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.name}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
              {account.name}
            </p>
            <p className="text-2xl font-semibold text-[var(--color-foreground)]">
              {account.balance}
            </p>
            <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
              <span>{account.change}</span>
              <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]">
                {account.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
