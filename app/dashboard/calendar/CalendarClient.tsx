"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Clock, CalendarDays } from "lucide-react";
import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const PLATFORM: Record<string, { label: string; color: string }> = {
  x: { label: "X", color: "#1DA1F2" },
  linkedin: { label: "in", color: "#0A66C2" },
  instagram: { label: "IG", color: "#E1306C" },
  tiktok: { label: "TT", color: "#a855f7" },
  threads: { label: "@", color: "#9ca3af" },
  youtube: { label: "YT", color: "#FF0000" },
};

export interface ScheduledPostSlim {
  id: string; platform: string; content: string; scheduled_at: string; status: string;
}

export function CalendarClient({ posts }: { posts: ScheduledPostSlim[] }) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => (i < firstDay ? null : i - firstDay + 1));

  const byDay = useMemo(() => {
    const map: Record<number, ScheduledPostSlim[]> = {};
    posts.forEach((p) => {
      const d = new Date(p.scheduled_at);
      if (d.getFullYear() === view.year && d.getMonth() === view.month) {
        (map[d.getDate()] ??= []).push(p);
      }
    });
    return map;
  }, [posts, view]);

  const upcoming = useMemo(
    () => [...posts].sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at)).slice(0, 6),
    [posts]
  );

  const shift = (dir: number) => {
    setView((v) => {
      const m = v.month + dir;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const isToday = (d: number) =>
    d === now.getDate() && view.month === now.getMonth() && view.year === now.getFullYear();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Workspace"
        title="Scheduler"
        sub="Every scheduled post, at a glance. Drag your strategy across the month."
        actions={
          <Link href="/dashboard/create" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 26px -10px rgba(99,102,241,0.8)" }}>
            <Plus className="h-4 w-4" /> Schedule post
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Scheduled" value={String(posts.length)} icon={CalendarDays} tone="indigo" />
        <StatTile label="This week" value={String(upcoming.length)} icon={Clock} tone="violet" />
        <StatTile label="Queued" value={String(posts.filter((p) => p.status === "queued").length)} icon={Clock} tone="gold" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* calendar */}
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[16px] font-semibold text-white">{MONTHS[view.month]} {view.year}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => shift(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/[0.06] hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setView({ year: now.getFullYear(), month: now.getMonth() })} className="rounded-lg px-2.5 py-1.5 text-[12px] text-white/60 hover:bg-white/[0.06] hover:text-white">Today</button>
              <button onClick={() => shift(1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/[0.06] hover:text-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((d) => <div key={d} className="pb-2 text-center font-data text-[10.5px] uppercase tracking-wider text-white/35">{d}</div>)}
            {cells.map((d, i) => (
              <div
                key={i}
                className="min-h-[76px] rounded-xl border p-1.5"
                style={{
                  borderColor: d && isToday(d) ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.05)",
                  background: d ? (isToday(d) ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)") : "transparent",
                }}
              >
                {d && (
                  <>
                    <span className={`text-[11px] ${isToday(d) ? "font-semibold text-[var(--sai-indigo)]" : "text-white/40"}`}>{d}</span>
                    <div className="mt-1 space-y-1">
                      {(byDay[d] ?? []).slice(0, 2).map((p) => {
                        const meta = PLATFORM[p.platform] ?? { label: "?", color: "#9ca3af" };
                        return (
                          <div key={p.id} className="flex items-center gap-1 rounded-md px-1 py-0.5" style={{ background: `color-mix(in srgb, ${meta.color} 16%, transparent)` }} title={p.content}>
                            <span className="text-[9px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                            <span className="truncate text-[10px] text-white/70">{p.content}</span>
                          </div>
                        );
                      })}
                      {(byDay[d]?.length ?? 0) > 2 && <span className="pl-1 text-[10px] text-white/35">+{byDay[d].length - 2} more</span>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* upcoming */}
        <GlassCard className="h-fit p-5">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-white/45">Upcoming</p>
          {upcoming.length === 0 ? (
            <div className="mt-5 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-white/20" />
              <p className="mt-2 text-[13px] text-white/45">Nothing scheduled yet.</p>
              <Link href="/dashboard/create" className="mt-3 inline-block text-[13px] text-[var(--sai-indigo)] hover:underline">Create your first post →</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {upcoming.map((p) => {
                const meta = PLATFORM[p.platform] ?? { label: "?", color: "#9ca3af" };
                const d = new Date(p.scheduled_at);
                return (
                  <div key={p.id} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>{meta.label}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-white/80">{p.content}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[11px] text-white/40">{d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                        {p.status === "queued" && <Pill tone="gold">queued</Pill>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
