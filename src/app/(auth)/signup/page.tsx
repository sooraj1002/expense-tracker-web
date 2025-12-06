"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, register } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    setError(null);
    setLoading(true);
    try {
      await register({ email, password, name });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
          Tracker web
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
          Create your account
        </h1>
        <p className="text-[var(--color-muted-foreground)]">
          Set up the web companion to keep expenses in sync with your Android
          app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-foreground)]">
          Name
          <Input
            name="name"
            placeholder="Taylor Budgeteer"
            autoComplete="name"
            disabled={loading}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-foreground)]">
          Email
          <Input
            required
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-foreground)]">
          Password
          <Input
            required
            type="password"
            name="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={loading}
          />
        </label>
        {error ? (
          <div className="rounded-2xl border border-[var(--color-negative)]/40 bg-[var(--color-negative)]/5 px-3 py-2 text-sm text-[var(--color-negative)]">
            {error}
          </div>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="text-sm text-[var(--color-muted-foreground)]">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--color-brand)] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
