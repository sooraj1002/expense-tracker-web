"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { clearTokens } from "@/lib/api-client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useAuth();

  useEffect(() => {
    if (!isLoading && isError) {
      clearTokens();
      router.replace("/login");
    }
  }, [isError, isLoading, router]);

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="animate-pulse rounded-2xl bg-[var(--color-muted)] px-6 py-4 text-sm font-semibold text-[var(--color-muted-foreground)]">
          Checking session…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 text-sm shadow-sm">
          <p className="font-semibold text-[var(--color-foreground)]">
            Session expired
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            {error instanceof Error ? error.message : "Please sign in again."}
          </p>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => router.push("/login")}>Go to login</Button>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return <>{children}</>;
}
