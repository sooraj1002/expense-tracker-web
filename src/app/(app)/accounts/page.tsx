"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "@/hooks/use-queries";
import type { Account } from "@/lib/types";

type FormMode = "create" | "edit" | "fund";

export default function AccountsPage() {
  const { data, isLoading, isError, refetch } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const accounts = useMemo(() => data ?? [], [data]);
  const [mode, setMode] = useState<FormMode>("create");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );
  const isSaving = createAccount.isPending || updateAccount.isPending;

  function resetForm() {
    setMode("create");
    setSelectedAccountId(null);
    setName("");
    setAmount("");
    setFormError(null);
  }

  function openCreateForm() {
    resetForm();
    setPageMessage(null);
  }

  function openEditForm(account: Account) {
    setMode("edit");
    setSelectedAccountId(account.id);
    setName(account.name);
    setAmount(String(account.initialBalance ?? account.currentBalance ?? 0));
    setFormError(null);
    setPageMessage(null);
  }

  function openFundForm(account: Account) {
    setMode("fund");
    setSelectedAccountId(account.id);
    setName(account.name);
    setAmount("");
    setFormError(null);
    setPageMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setPageMessage(null);

    const trimmedName = name.trim();
    const parsedAmount = Number.parseFloat(amount);

    if (!trimmedName) {
      setFormError("Account name is required.");
      return;
    }

    if (Number.isNaN(parsedAmount)) {
      setFormError(
        mode === "fund"
          ? "Enter a valid top-up amount."
          : "Enter a valid starting balance.",
      );
      return;
    }

    if (mode === "fund" && parsedAmount === 0) {
      setFormError("Top-up amount cannot be zero.");
      return;
    }

    if (mode !== "fund" && parsedAmount < 0) {
      setFormError("Balance cannot be negative.");
      return;
    }

    try {
      if (mode === "create") {
        await createAccount.mutateAsync({
          name: trimmedName,
          initialBalance: parsedAmount,
        });
        setPageMessage("Account created.");
      } else if (mode === "edit" && selectedAccountId) {
        await updateAccount.mutateAsync({
          id: selectedAccountId,
          payload: {
            name: trimmedName,
            initialBalance: parsedAmount,
          },
        });
        setPageMessage("Account updated.");
      } else if (mode === "fund" && selectedAccountId && selectedAccount) {
        const baseInitial =
          selectedAccount.initialBalance ?? selectedAccount.currentBalance ?? 0;
        await updateAccount.mutateAsync({
          id: selectedAccountId,
          payload: {
            name: trimmedName,
            initialBalance: baseInitial + parsedAmount,
          },
        });
        setPageMessage("Funds added to account.");
      }

      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save account.",
      );
    }
  }

  async function handleDelete(account: Account) {
    const confirmed = window.confirm(
      `Delete ${account.name}? This will fail if the account already has expenses.`,
    );
    if (!confirmed) return;

    setFormError(null);
    setPageMessage(null);
    try {
      await deleteAccount.mutateAsync(account.id);
      if (selectedAccountId === account.id) {
        resetForm();
      }
      setPageMessage("Account deleted.");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to delete account.",
      );
    }
  }

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
            Manage the funding sources used by manual expenses and synced transactions.
          </p>
        </div>
        <Button size="sm" onClick={openCreateForm}>
          New account
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            {mode === "create"
              ? "Add account"
              : mode === "edit"
                ? "Edit account"
                : "Add funds"}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--color-foreground)]">
            {mode === "create"
              ? "Create a new account"
              : mode === "edit"
                ? "Update account details"
                : "Top up an existing account"}
          </h2>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-1 text-sm font-semibold text-[var(--color-foreground)]">
              <span>Account name</span>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="HDFC Savings"
              />
            </label>
            <label className="block space-y-1 text-sm font-semibold text-[var(--color-foreground)]">
              <span>
                {mode === "fund" ? "Top-up amount" : "Starting balance"}
              </span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={mode === "fund" ? "5000" : "25000"}
              />
            </label>

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
                {isSaving
                  ? "Saving…"
                  : mode === "create"
                    ? "Create account"
                    : mode === "edit"
                      ? "Save changes"
                      : "Add funds"}
              </Button>
              {mode !== "create" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openCreateForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="space-y-4">
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
              No accounts yet. Create one to start tracking expenses.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {accounts.map((account) => {
                const deletingThis =
                  deleteAccount.isPending && deleteAccount.variables === account.id;

                return (
                  <div
                    key={account.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-[var(--color-foreground)]">
                          {account.name}
                        </p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          Current balance
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]">
                        In sync
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-2xl font-semibold text-[var(--color-foreground)]">
                        ₹{account.currentBalance?.toLocaleString?.("en-IN") ?? "--"}
                      </p>
                      <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
                        <span>
                          Start: ₹{account.initialBalance?.toLocaleString?.("en-IN") ?? 0}
                        </span>
                        <span>
                          Spent: ₹{account.totalSpent?.toLocaleString?.("en-IN") ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(account)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() => openFundForm(account)}
                      >
                        Add funds
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingThis}
                        onClick={() => handleDelete(account)}
                      >
                        {deletingThis ? "Deleting…" : "Delete"}
                      </Button>
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
