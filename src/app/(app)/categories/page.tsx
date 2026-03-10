"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-queries";

const DEFAULT_COLOR = "#2563eb";

export default function CategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategories();
  const categories = useMemo(() => data ?? [], [data]);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  const isSaving = createCategory.isPending || updateCategory.isPending;
  const isEditing = editingId !== null;
  const customCategories = useMemo(
    () => categories.filter((category) => !category.isDefault),
    [categories],
  );

  function resetForm() {
    setEditingId(null);
    setName("");
    setColor(DEFAULT_COLOR);
    setFormError(null);
  }

  function beginEdit(category: (typeof categories)[number]) {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color ?? DEFAULT_COLOR);
    setFormError(null);
    setPageMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const normalizedColor = color.trim().toUpperCase();

    if (!trimmedName) {
      setFormError("Category name is required.");
      return;
    }

    if (!/^#[0-9A-F]{6}$/.test(normalizedColor)) {
      setFormError("Use a valid HEX color like #2563EB.");
      return;
    }

    try {
      if (editingId) {
        await updateCategory.mutateAsync({
          id: editingId,
          payload: { name: trimmedName, color: normalizedColor },
        });
        setPageMessage("Category updated.");
      } else {
        await createCategory.mutateAsync({
          name: trimmedName,
          color: normalizedColor,
        });
        setPageMessage("Category created.");
      }
      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save category.",
      );
    }
  }

  async function handleDelete(categoryId: string) {
    setFormError(null);
    setPageMessage(null);
    const confirmed = window.confirm(
      "Delete this custom category? Existing expenses may become harder to manage.",
    );
    if (!confirmed) return;

    try {
      await deleteCategory.mutateAsync(categoryId);
      if (editingId === categoryId) {
        resetForm();
      }
      setPageMessage("Category deleted.");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to delete category.",
      );
    }
  }

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
            Manage default and custom categories from the web app.
          </p>
        </div>
        <Button size="sm" onClick={resetForm}>
          {isEditing ? "New category" : "Create category"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            {isEditing ? "Edit category" : "Add category"}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--color-foreground)]">
            {isEditing ? "Update custom category" : "Create a custom category"}
          </h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-1 text-sm font-semibold text-[var(--color-foreground)]">
              <span>Name</span>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Groceries"
                maxLength={40}
              />
            </label>
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <label className="block space-y-1 text-sm font-semibold text-[var(--color-foreground)]">
                <span>Color</span>
                <Input
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  placeholder="#2563EB"
                  maxLength={7}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-foreground)]">
                <span>Preview</span>
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(color) ? color : DEFAULT_COLOR}
                  onChange={(event) => setColor(event.target.value.toUpperCase())}
                  className="h-11 w-16 cursor-pointer rounded-2xl border border-[var(--color-border)] bg-transparent p-1"
                />
              </label>
            </div>

            {formError ? (
              <div className="rounded-2xl border border-[var(--color-negative)]/30 bg-[var(--color-negative)]/5 px-4 py-3 text-sm text-[var(--color-negative)]">
                {formError}
              </div>
            ) : null}

            {pageMessage ? (
              <div className="rounded-2xl border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5 px-4 py-3 text-sm text-[var(--color-brand-strong)]">
                {pageMessage}
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create category"}
              </Button>
              {isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>

          <div className="mt-6 rounded-2xl bg-[var(--color-muted)]/60 p-4 text-sm text-[var(--color-muted-foreground)]">
            <p className="font-semibold text-[var(--color-foreground)]">
              Custom categories
            </p>
            <p>{customCategories.length} editable categories available.</p>
          </div>
        </div>

        <div className="space-y-4">
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
              No categories yet. Create one to start classifying expenses.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((category) => {
                const isBusy =
                  deleteCategory.isPending &&
                  deleteCategory.variables === category.id;

                return (
                  <div
                    key={category.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full border border-black/5"
                          style={{ backgroundColor: category.color ?? DEFAULT_COLOR }}
                        />
                        <div>
                          <p className="text-base font-semibold text-[var(--color-foreground)]">
                            {category.name}
                          </p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">
                            {category.isDefault ? "Default category" : "Custom category"}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]">
                        {category.isDefault ? "Locked" : "Editable"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={category.isDefault}
                        onClick={() => beginEdit(category)}
                      >
                        Edit
                      </Button>
                      {!category.isDefault ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleDelete(category.id)}
                        >
                          {isBusy ? "Deleting…" : "Delete"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
