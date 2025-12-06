import { Button } from "@/components/ui/button";

const categories = [
  { name: "Food & Dining", color: "#f97316", count: 38 },
  { name: "Transport", color: "#2563eb", count: 18 },
  { name: "Shopping", color: "#7c3aed", count: 22 },
  { name: "Bills & Utilities", color: "#0891b2", count: 9 },
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">
            Categories
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Keep spend organized
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Reuse the Android palette and defaults; map patterns to these tags.
          </p>
        </div>
        <Button size="sm">Create category</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <p className="text-base font-semibold text-[var(--color-foreground)]">
                  {category.name}
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {category.count} expenses
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
