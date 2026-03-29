"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";

export type VoiceStatus =
  | "idle"
  | "waking"
  | "listening"
  | "processing"
  | "confirming"
  | "speaking"
  | "error";

export type PendingExpense = {
  amount: number;
  description: string;
  categoryName: string;
  accountName: string;
  date: string;
  tags: string[];
};

export type VoiceAction = { tool: string; success?: boolean };

const VOICE_SERVER_URL =
  process.env.NEXT_PUBLIC_VOICE_SERVER_URL ?? "http://localhost:8765";
const WS_URL = VOICE_SERVER_URL.replace(/^http/, "ws");

// Silence detection: if RMS stays below this for SILENCE_DURATION_MS, auto end-turn
const SILENCE_THRESHOLD = 0.015;
const SILENCE_DURATION_MS = 1800;

export function useVoice() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<VoiceAction | null>(null);
  const [pendingExpense, setPendingExpense] = useState<PendingExpense | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<VoiceStatus>("idle");

  // Keep statusRef in sync so closures can read the latest value
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
  }, []);

  const endTurn = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "end_turn" }));
      setStatus("processing");
    }
  }, []);

  const playAudio = useCallback(async (data: ArrayBuffer) => {
    setStatus("speaking");
    try {
      const ctx =
        audioCtxRef.current ?? new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") await ctx.resume();

      const buffer = await ctx.decodeAudioData(data.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        if (statusRef.current === "speaking") {
          setStatus("listening");
        }
      };
      source.start();
    } catch (e) {
      console.error("Audio playback failed:", e);
      setStatus("listening");
    }
  }, []);

  const startSilenceDetection = useCallback(
    (stream: MediaStream) => {
      const ctx =
        audioCtxRef.current ?? new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Float32Array(analyser.fftSize);

      const checkSilence = () => {
        if (statusRef.current !== "listening") return;

        analyser.getFloatTimeDomainData(dataArray);
        const rms = Math.sqrt(
          dataArray.reduce((sum, v) => sum + v * v, 0) / dataArray.length
        );

        if (rms < SILENCE_THRESHOLD) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (statusRef.current === "listening") {
                endTurn();
              }
              silenceTimerRef.current = null;
            }, SILENCE_DURATION_MS);
          }
        } else {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }

        if (statusRef.current === "listening" || statusRef.current === "processing") {
          requestAnimationFrame(checkSilence);
        }
      };

      requestAnimationFrame(checkSilence);
    },
    [endTurn]
  );

  const openWebSocket = useCallback(
    (token: string) => {
      const ws = new WebSocket(`${WS_URL}/ws?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = async () => {
        setStatus("listening");

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          streamRef.current = stream;

          const recorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000,
          });
          recorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(e.data);
            }
          };

          recorder.start(250);
          startSilenceDetection(stream);
        } catch (e: unknown) {
          const msg =
            e instanceof DOMException && e.name === "NotAllowedError"
              ? "Microphone access denied. Allow it in browser settings."
              : "Failed to access microphone.";
          setError(msg);
          setStatus("error");
          ws.close();
        }
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === "string") {
          const msg = JSON.parse(event.data) as {
            type: string;
            text?: string;
            message?: string;
            tool?: string;
            success?: boolean;
          };

          if (msg.type === "transcript" && msg.text) {
            setTranscript(msg.text);
          } else if (msg.type === "thinking") {
            setStatus("processing");
          } else if (msg.type === "confirm_expense" && msg.details) {
            setPendingExpense(msg.details as PendingExpense);
            setStatus("confirming");
          } else if (msg.type === "done") {
            setPendingExpense(null);
            setStatus("listening");
          } else if (msg.type === "tool_result" && msg.tool) {
            setLastAction({ tool: msg.tool, success: msg.success });
          } else if (msg.type === "error") {
            setError(msg.message ?? "An error occurred.");
            setStatus("error");
          }
        } else if (event.data instanceof Blob) {
          const buffer = await event.data.arrayBuffer();
          await playAudio(buffer);
        } else if (event.data instanceof ArrayBuffer) {
          await playAudio(event.data);
        }
      };

      ws.onclose = () => {
        stopRecording();
        if (statusRef.current !== "idle") {
          setStatus("idle");
        }
      };

      ws.onerror = () => {
        setError("Connection to voice server lost.");
        setStatus("error");
        stopRecording();
      };
    },
    [playAudio, startSilenceDetection, stopRecording]
  );

  const startVoice = useCallback(async () => {
    setStatus("waking");
    setError(null);
    setTranscript(null);
    setLastAction(null);

    const token = Cookies.get("tracker_access");
    if (!token) {
      setError("Not authenticated.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch(`${VOICE_SERVER_URL}/wake`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Wake failed: ${res.status}`);
    } catch {
      setError("Voice server unreachable. Is it running on the Fedora machine?");
      setStatus("error");
      return;
    }

    openWebSocket(token);
  }, [openWebSocket]);

  const confirmExpense = useCallback((confirmed: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "confirm_result", confirmed }));
      setPendingExpense(null);
      setStatus("processing");
    }
  }, []);

  const stopVoice = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    stopRecording();
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("idle");
    setTranscript(null);
    setError(null);
  }, [stopRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopVoice();
      audioCtxRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    transcript,
    error,
    lastAction,
    pendingExpense,
    startVoice,
    stopVoice,
    endTurn,
    confirmExpense,
  };
}
