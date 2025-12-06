import { Button } from "@/components/ui/button";

const sampleExpenses = [
  {
    id: "1",
    merchant: "Uber",
    category: "Transport",
    amount: "-₹420",
    date: "Today, 9:15 AM",
    status: "Auto",
  },
  {
    id: "2",
    merchant: "Reliance Fresh",
    category: "Groceries",
    amount: "-₹1,150",
    date: "Yesterday",
    status: "Needs review",
  },
  {
    id: "3",
    merchant: "Coffee Bar",
    category: "Food",
    amount: "-₹210",
    date: "Yesterday",
    status: "Verified",
  },
];

export default function ExpensesPage() {
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

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/70 px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)]">
        Filters coming soon: date ranges, categories, accounts, verified vs
        pending.
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] gap-2 border-b border-[var(--color-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          <span>Merchant</span>
          <span>Category</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Date</span>
          <span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {sampleExpenses.map((expense) => (
            <div
              key={expense.id}
              className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] items-center gap-2 px-4 py-3 text-sm"
            >
              <div className="font-semibold text-[var(--color-foreground)]">
                {expense.merchant}
              </div>
              <div className="text-[var(--color-muted-foreground)]">
                {expense.category}
              </div>
              <div className="text-right font-semibold text-[var(--color-foreground)]">
                {expense.amount}
              </div>
              <div className="text-right text-[var(--color-muted-foreground)]">
                {expense.date}
              </div>
              <div className="text-right">
                <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]">
                  {expense.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
