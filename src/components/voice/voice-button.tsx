"use client";

import { Loader2, Mic, MicOff, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { VoiceStatus } from "@/hooks/use-voice";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  status: VoiceStatus;
  onClick: () => void;
}

export function VoiceButton({ status, onClick }: VoiceButtonProps) {
  const isActive = status !== "idle" && status !== "error";
  const isError = status === "error";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={isActive ? "Stop voice mode" : "Start voice mode"}
      className={cn(
        "relative transition-all",
        status === "listening" &&
          "text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/50",
        isError && "text-red-500"
      )}
    >
      {status === "waking" || status === "processing" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === "speaking" ? (
        <Volume2 className="h-4 w-4" />
      ) : status === "listening" ? (
        <>
          <Mic className="h-4 w-4" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-md animate-ping bg-[var(--color-brand)]/20" />
        </>
      ) : isError ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
