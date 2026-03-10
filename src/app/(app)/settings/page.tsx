"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearTokens } from "@/lib/api-client";

export default function SettingsPage() {
  const router = useRouter();

  function handleLogout() {
    clearTokens();
    router.replace("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">
            Settings
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Session & sync
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Control authentication, tokens, and backend connectivity for the web
            companion.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Clear session
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            Authentication
          </p>
          <p className="text-sm text-[var(--color-foreground)]">
            Tokens are stored in cookies. On unauthorized responses the app will
            attempt a refresh and redirect to login if it fails.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            Backend
          </p>
          <p className="text-sm text-[var(--color-foreground)]">
            Configure <code className="rounded bg-[var(--color-muted)] px-1">NEXT_PUBLIC_API_BASE_URL</code>{" "}
            to point at the Go service. This web app now defaults to{" "}
            <code className="rounded bg-[var(--color-muted)] px-1">http://shadywrldserver:8082/api</code>.
            All API calls include cookies and bearer auth.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Reset tokens & re-auth
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
