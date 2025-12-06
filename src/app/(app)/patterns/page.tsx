import { Button } from "@/components/ui/button";

const patterns = [
  { merchant: "Amazon", category: "Shopping", match: "contains", status: "Active" },
  { merchant: "Uber", category: "Transport", match: "exact", status: "Active" },
  { merchant: "Coffee", category: "Food", match: "contains", status: "Paused" },
];

export default function PatternsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">
            Patterns
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Teach the matcher
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Manage rules that auto-categorize parsed notifications before they
            hit your review queue.
          </p>
        </div>
        <Button size="sm">Add pattern</Button>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="grid grid-cols-[1.1fr_1fr_0.6fr_0.6fr] gap-2 border-b border-[var(--color-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          <span>Merchant</span>
          <span>Category</span>
          <span>Match</span>
          <span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {patterns.map((pattern) => (
            <div
              key={pattern.merchant}
              className="grid grid-cols-[1.1fr_1fr_0.6fr_0.6fr] items-center gap-2 px-4 py-3 text-sm"
            >
              <span className="font-semibold text-[var(--color-foreground)]">
                {pattern.merchant}
              </span>
              <span className="text-[var(--color-muted-foreground)]">
                {pattern.category}
              </span>
              <span className="text-[var(--color-muted-foreground)]">
                {pattern.match}
              </span>
              <span className="text-right">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    pattern.status === "Active"
                      ? "bg-[var(--color-brand)]/10 text-[var(--color-brand-strong)]"
                      : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                  }`}
                >
                  {pattern.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
