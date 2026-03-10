"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Banknote,
  ChartPie,
  Layers,
  LayoutDashboard,
  Settings2,
  Wallet,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/expenses", icon: Banknote },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Categories", href: "/categories", icon: Layers },
  { label: "Reports", href: "/reports", icon: ChartPie },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="min-h-screen text-[var(--color-foreground)]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <header className="mb-6 flex items-center justify-between gap-4 rounded-3xl bg-[var(--color-surface)]/90 p-4 shadow-sm ring-1 ring-[var(--color-border)]/70 backdrop-blur">
            <Logo />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => router.push("/expenses?new=1")}
              >
                Quick add
              </Button>
              <Button size="sm" onClick={() => router.push("/expenses?new=1")}>
                New expense
              </Button>
            </div>
          </header>
          <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
            <aside className="hidden h-full flex-col rounded-3xl bg-[var(--color-surface)] p-4 shadow-sm ring-1 ring-[var(--color-border)]/80 lg:flex">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-all",
                        active
                          ? "bg-[var(--color-brand)] text-white shadow-sm shadow-[var(--color-brand)]/30"
                          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/80 hover:text-[var(--color-foreground)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto rounded-2xl bg-[var(--color-muted)]/80 p-4 text-sm text-[var(--color-muted-foreground)]">
                <p className="font-semibold text-[var(--color-foreground)]">
                  Sync status
                </p>
                <p>Connected to backend, tokens refresh automatically.</p>
              </div>
            </aside>
            <main className="rounded-3xl bg-[var(--color-surface)] p-4 shadow-sm ring-1 ring-[var(--color-border)]/70 md:p-6">
              <nav className="mb-4 grid grid-cols-2 gap-2 text-sm font-semibold lg:hidden">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl px-3 py-2 transition-all",
                        active
                          ? "bg-[var(--color-brand)] text-white shadow-sm shadow-[var(--color-brand)]/30"
                          : "text-[var(--color-muted-foreground)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-muted)]/60 hover:text-[var(--color-foreground)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
