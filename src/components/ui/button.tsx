"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all";
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[var(--color-brand)] text-white shadow-sm hover:bg-[var(--color-brand-strong)] active:translate-y-[1px]",
      ghost:
        "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/60 border border-transparent",
      outline:
        "border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-foreground)]/20 hover:bg-[var(--color-muted)]/40",
      soft:
        "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/80 border border-transparent",
    };
    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "text-sm px-3 py-2",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-5 py-3",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
