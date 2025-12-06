import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-queries";

export default function CategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategories();
  const categories = data ?? [];

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

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted-foreground)] shadow-sm">
          Loading categories…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm shadow-sm">
          <div>
            <p className="font-semibold text-[var(--color-foreground)]">
              Unable to load categories
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              Check your connection or auth; ensure backend URL is set.
            </p>
          </div>
          <Button size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/70 px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)]">
          No categories yet. Create one or reuse mobile defaults.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color ?? "#2563eb" }}
                />
                <div>
                  <p className="text-base font-semibold text-[var(--color-foreground)]">
                    {category.name}
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {category.isDefault ? "Default" : "Custom"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
