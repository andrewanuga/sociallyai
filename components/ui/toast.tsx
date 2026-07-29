"use client";

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type Variant = "error" | "success" | "info";

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant: Variant;
  duration: number;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: Variant;
  duration?: number;
};

const ToastCtx = createContext<{
  toast: (t: ToastInput) => void;
  error: (title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const META: Record<Variant, { icon: typeof AlertCircle; color: string }> = {
  error: { icon: AlertCircle, color: "var(--sai-red)" },
  success: { icon: CheckCircle2, color: "var(--sai-indigo)" },
  info: { icon: Info, color: "var(--sai-violet)" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((t: ToastInput) => {
    const id = ++idRef.current;
    const duration = t.duration ?? 4800;
    setToasts((prev) => [
      ...prev,
      { id, title: t.title, description: t.description, variant: t.variant ?? "info", duration },
    ].slice(-4)); // cap the stack
  }, []);

  const error = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: "error" }),
    [toast]
  );
  const success = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: "success" }),
    [toast]
  );

  return (
    <ToastCtx.Provider value={{ toast, error, success }}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex flex-col items-center gap-2.5 px-4 pt-4 sm:inset-x-auto sm:right-5 sm:items-end">
            {toasts.map((t) => (
              <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
            ))}
          </div>,
          document.body
        )}
    </ToastCtx.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, color } = META[toast.variant];

  const close = useCallback(() => {
    setLeaving(true);
    window.setTimeout(onDismiss, 260);
  }, [onDismiss]);

  useEffect(() => {
    const t = window.setTimeout(close, toast.duration);
    return () => window.clearTimeout(t);
  }, [close, toast.duration]);

  return (
    <div
      role="alert"
      className={`glass-panel pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-3.5 pr-2.5 ${
        leaving ? "sai-toast-out" : "sai-toast-in"
      }`}
      style={{ background: "rgba(22,22,26,0.82)" }}
    >
      <span
        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[13.5px] font-medium leading-snug text-white">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-[12.5px] leading-snug text-white/55">{toast.description}</p>
        )}
      </div>
      <button
        onClick={close}
        aria-label="Dismiss"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      {/* accent progress bar */}
      <span
        className="sai-toast-bar absolute bottom-0 left-3.5 right-3.5 h-px origin-left rounded-full"
        style={{ background: color, animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}
