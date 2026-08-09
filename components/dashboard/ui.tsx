"use client";

import { cn } from "@/lib/utils";

/* ── Shared premium dashboard primitives (dark glass system) ──────── */

export function GlassCard({
  className,
  children,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl",
        hover && "transition-transform duration-300 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <span className="font-data text-[11px] uppercase tracking-[0.22em] text-[var(--sai-indigo)]">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display mt-1.5 text-[26px] font-semibold tracking-[-0.02em] text-[var(--fg)] sm:text-[30px]">
          {title}
        </h1>
        {sub && <p className="mt-1.5 max-w-xl text-sm text-[var(--fg-3)]">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  delta,
  icon: Icon,
  tone = "indigo",
}: {
  label: string;
  value: string;
  delta?: { dir: "up" | "down"; value: string };
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tone?: "indigo" | "violet" | "gold" | "red" | "green";
}) {
  const color =
    tone === "violet" ? "var(--sai-violet)"
    : tone === "gold" ? "var(--sai-gold)"
    : tone === "red" ? "var(--sai-red)"
    : tone === "green" ? "#34d399"
    : "var(--sai-indigo)";
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--fg-3)]">{label}</span>
        {Icon && (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-2xl font-semibold text-[var(--fg)]">{value}</span>
        {delta && (
          <span
            className="mb-1 font-data text-[12px]"
            style={{ color: delta.dir === "up" ? "#34d399" : "var(--sai-red)" }}
          >
            {delta.dir === "up" ? "▲" : "▼"} {delta.value}
          </span>
        )}
      </div>
    </GlassCard>
  );
}

export function GhostButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2 text-[13px] font-medium text-[var(--fg)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-[var(--fg)] transition-transform duration-200 hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100",
        className
      )}
      style={{
        background: "linear-gradient(135deg,#6366f1,#a855f7)",
        boxShadow: "0 0 26px -10px rgba(99,102,241,0.8)",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = "indigo",
  className,
}: {
  children: React.ReactNode;
  tone?: "indigo" | "violet" | "gold" | "red" | "green" | "muted";
  className?: string;
}) {
  const color =
    tone === "violet" ? "var(--sai-violet)"
    : tone === "gold" ? "var(--sai-gold)"
    : tone === "red" ? "var(--sai-red)"
    : tone === "green" ? "#34d399"
    : tone === "muted" ? "var(--fg-3)"
    : "var(--sai-indigo)";
  return (
    <span
      className={cn("font-data inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] uppercase tracking-wider", className)}
      style={{ color, background: `color-mix(in srgb, ${color} 13%, transparent)` }}
    >
      {children}
    </span>
  );
}
