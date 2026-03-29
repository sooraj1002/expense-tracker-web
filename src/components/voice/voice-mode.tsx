"use client";

import { useEffect } from "react";
import { Loader2, Mic, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import type { useVoice } from "@/hooks/use-voice";
import { cn } from "@/lib/utils";

interface VoiceModeProps {
  onClose: () => void;
  voice: ReturnType<typeof useVoice>;
}

const STATUS_LABEL: Record<string, string> = {
  waking: "Starting up…",
  listening: "Listening…",
  processing: "Thinking…",
  confirming: "Confirm expense",
  speaking: "Speaking…",
  error: "Error",
  idle: "",
};

export function VoiceMode({ onClose, voice }: VoiceModeProps) {
  const queryClient = useQueryClient();
  const { status, transcript, error, lastAction, pendingExpense, endTurn, stopVoice, confirmExpense } = voice;

  // Invalidate React Query caches when an expense is added
  useEffect(() => {
    if (lastAction?.tool === "add_expense") {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }
  }, [lastAction, queryClient]);

  const handleClose = () => {
    stopVoice();
    onClose();
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0">
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 shadow-xl ring-1 ring-[var(--color-border)]/80">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusRing status={status} />
            <span className="text-sm font-semibold text-[var(--color-foreground)]">
              {STATUS_LABEL[status] ?? "Voice Mode"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 rounded-full p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mb-3 rounded-2xl bg-[var(--color-muted)]/60 px-3 py-2 text-sm text-[var(--color-foreground)]">
            <span className="mr-1 text-xs font-semibold text-[var(--color-muted-foreground)]">
              You:
            </span>
            {transcript}
          </div>
        )}

        {/* Error */}
        {status === "error" && error && (
          <div className="mb-3 rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Expense confirmation card */}
        {status === "confirming" && pendingExpense && (
          <div className="mb-3 rounded-2xl bg-[var(--color-muted)]/60 p-3 text-sm">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-[var(--color-foreground)]">
                {pendingExpense.amount.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {pendingExpense.date}
              </span>
            </div>
            <p className="font-medium text-[var(--color-foreground)]">
              {pendingExpense.description}
            </p>
            <p className="mt-0.5 text-[var(--color-muted-foreground)]">
              {pendingExpense.categoryName} · {pendingExpense.accountName}
            </p>
            {pendingExpense.tags?.length > 0 && pendingExpense.tags[0] !== "misc" && (
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                {pendingExpense.tags.join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Action confirmation */}
        {lastAction?.tool === "add_expense" && lastAction.success && (
          <div className="mb-3 rounded-2xl bg-[var(--color-brand)]/10 px-3 py-2 text-sm font-medium text-[var(--color-brand)]">
            Expense added ✓
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-2">
          {status === "confirming" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => confirmExpense(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => confirmExpense(true)}
              >
                Add expense
              </Button>
            </>
          )}
          {status === "listening" && (
            <Button
              size="sm"
              className="flex-1"
              onClick={endTurn}
            >
              <Mic className="mr-1.5 h-3.5 w-3.5" />
              Done speaking
            </Button>
          )}
          {status === "error" && (
            <Button
              size="sm"
              className="flex-1"
              onClick={handleClose}
            >
              Close
            </Button>
          )}
          {(status === "processing" || status === "waking") && (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-muted)]/60 px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {status === "waking" ? "Loading model…" : "Processing…"}
            </div>
          )}
        </div>

        {/* Hint */}
        {status === "listening" && (
          <p className="mt-2 text-center text-xs text-[var(--color-muted-foreground)]">
            Speak naturally — silence auto-submits
          </p>
        )}
      </div>
    </div>
  );
}

function StatusRing({ status }: { status: string }) {
  return (
    <div
      className={cn(
        "h-3 w-3 rounded-full",
        status === "listening" && "animate-pulse bg-[var(--color-brand)]",
        (status === "waking" || status === "processing" || status === "speaking") && "bg-yellow-400",
        status === "confirming" && "bg-orange-400",
        status === "error" && "bg-red-500",
        status === "idle" && "bg-[var(--color-muted-foreground)]"
      )}
    />
  );
}
