import { Button } from "@/components/ui/button";

export default function ReportsPage() {
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
            Build charts, compare ranges, and export CSVs for audits or sharing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button size="sm">Schedule email</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-strong)] p-4 text-white shadow-lg shadow-[var(--color-brand)]/20">
          <p className="text-sm font-semibold">Spending timeline</p>
          <p className="text-lg font-semibold">Charts coming soon</p>
          <p className="text-sm opacity-80">
            Daily/weekly burn, category rollups, and trend deltas will render
            here.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            Export routines
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-foreground)]">
            <li>• CSV export with applied filters</li>
            <li>• Shareable links for auditors/partners</li>
            <li>• Scheduled weekly digest to email</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
