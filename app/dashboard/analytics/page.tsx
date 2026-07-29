"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye, Heart, Users, DollarSign, ArrowUpRight, Sparkles, FlaskConical, Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";

/* ── tiny dependency-free SVG charts ──────────────────────────────── */

function AreaChart({ data, color = "#6366f1", height = 150 }: { data: number[]; color?: string; height?: number }) {
  const w = 560, h = height, pad = 6;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${h} L${x(0)},${h} Z`;
  const gid = `g-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 26, max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
  return <svg width={w} height={h} className="overflow-visible"><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" /></svg>;
}

/* ── representative series (deterministic) ────────────────────────── */
const series = (seed: number, n = 24) =>
  Array.from({ length: n }, (_, i) => Math.round(40 + Math.sin(i / 2 + seed) * 18 + (i * (seed % 3 + 1)) + (i % 4) * 6));

const PLATFORMS = [
  { name: "X", value: 82, color: "#1DA1F2" },
  { name: "LinkedIn", value: 64, color: "#0A66C2" },
  { name: "Instagram", value: 48, color: "#E1306C" },
  { name: "TikTok", value: 35, color: "#a855f7" },
];

const TOP_CONTENT = [
  { platform: "X", best: "LinkedIn", text: "The 5-step system I used to go 0→10K…", impr: "48.2K", eng: "9.1%", lift: "3.2×", spark: series(1, 12), tone: "indigo" as const },
  { platform: "Instagram", best: "TikTok", text: "This ₦340k post nobody expected…", impr: "31.7K", eng: "7.4%", lift: "2.6×", spark: series(4, 12), tone: "violet" as const },
  { platform: "LinkedIn", best: "X", text: "Why 'post more' is killing your reach", impr: "22.9K", eng: "6.0%", lift: "1.9×", spark: series(7, 12), tone: "gold" as const },
];

const RANGES = ["7d", "30d", "90d"] as const;

export default function AnalyticsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("30d");
  const [persona, setPersona] = useState<string>("creator");
  const impressions = useMemo(() => series(range === "7d" ? 2 : range === "90d" ? 5 : 3), [range]);
  const engagement = useMemo(() => series(range === "7d" ? 6 : range === "90d" ? 9 : 7), [range]);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("profiles").select("persona").eq("id", user.id).single();
        if (data?.persona) setPersona(data.persona);
      } catch { /* offline */ }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        sub="Understand what's working — per account and per post — and where to take it next."
        actions={
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-[12.5px]">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className="rounded-full px-3 py-1 transition-colors"
                style={range === r ? { background: "rgba(99,102,241,0.2)", color: "#fff" } : { color: "rgba(255,255,255,0.5)" }}>
                {r}
              </button>
            ))}
          </div>
        }
      />

      {/* stat tiles */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Impressions" value="248.6K" delta={{ dir: "up", value: "18%" }} icon={Eye} tone="indigo" />
        <StatTile label="Engagement rate" value="7.9%" delta={{ dir: "up", value: "1.4pt" }} icon={Heart} tone="violet" />
        <StatTile label="Followers gained" value="+3,204" delta={{ dir: "up", value: "22%" }} icon={Users} tone="green" />
        <StatTile label="Revenue attributed" value="₦512K" delta={{ dir: "down", value: "3%" }} icon={DollarSign} tone="gold" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* performance chart */}
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-[15px] font-semibold text-white">Performance over time</p>
              <div className="mt-1 flex items-center gap-4 text-[12px]">
                <span className="flex items-center gap-1.5 text-white/55"><span className="h-2 w-2 rounded-full" style={{ background: "#6366f1" }} /> Impressions</span>
                <span className="flex items-center gap-1.5 text-white/55"><span className="h-2 w-2 rounded-full" style={{ background: "#a855f7" }} /> Engagement</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <AreaChart data={impressions} color="#6366f1" />
            <div className="-mt-[150px]"><AreaChart data={engagement} color="#a855f7" height={150} /></div>
          </div>
        </GlassCard>

        {/* engagement by platform */}
        <GlassCard className="p-5">
          <p className="font-display text-[15px] font-semibold text-white">Engagement by platform</p>
          <div className="mt-5 space-y-4">
            {PLATFORMS.map((p) => (
              <div key={p.name}>
                <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                  <span className="text-white/70">{p.name}</span>
                  <span className="font-data text-white/45">{p.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full" style={{ width: `${p.value}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Per-content + cross-post reference engine ── */}
      <div className="mt-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--sai-indigo)]" />
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-white/50">Content reference engine</p>
        </div>
        <div className="space-y-3">
          {TOP_CONTENT.map((c, i) => (
            <GlassCard key={i} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Pill tone={c.tone}>{c.platform}</Pill>
                <p className="min-w-0 flex-1 truncate text-[14px] text-white/85">{c.text}</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right"><p className="font-data text-[13px] text-white">{c.impr}</p><p className="text-[11px] text-white/40">impressions</p></div>
                <div className="text-right"><p className="font-data text-[13px] text-white">{c.eng}</p><p className="text-[11px] text-white/40">engagement</p></div>
                <Sparkline data={c.spark} color="#34d399" />
                {/* reference suggestion */}
                <div className="flex items-center gap-2 rounded-xl border border-[var(--sai-indigo)]/25 bg-[var(--sai-indigo)]/10 px-3 py-2">
                  <ArrowUpRight className="h-4 w-4 text-[var(--sai-indigo)]" />
                  <span className="text-[12px] text-white/75"><b className="text-white">{c.lift}</b> vs avg — repost to <b className="text-white">{c.best}</b>?</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ── A/B testing (highlighted for marketers) ── */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-[var(--sai-violet)]" />
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-white/50">
            A/B testing {persona === "marketer" && <span className="text-[var(--sai-violet)]">· recommended for you</span>}
          </p>
        </div>
        <GlassCard className="p-5">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { v: "A", hook: "\"Stop posting. Start sharing insights.\"", conv: 4.8, win: true },
              { v: "B", hook: "\"The growth hack founders sleep on.\"", conv: 3.1, win: false },
            ].map((t) => (
              <div key={t.v} className="rounded-2xl border p-4" style={{ borderColor: t.win ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.08)", background: t.win ? "rgba(168,85,247,0.06)" : "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[15px] font-semibold text-white">Variant {t.v}</span>
                  {t.win && <Pill tone="violet"><Trophy className="h-3 w-3" /> Winner</Pill>}
                </div>
                <p className="mt-2 text-[13.5px] italic text-white/70">{t.hook}</p>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[12px]"><span className="text-white/50">Conversion rate</span><span className="font-data text-white">{t.conv}%</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full" style={{ width: `${(t.conv / 5) * 100}%`, background: t.win ? "linear-gradient(90deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.25)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] text-white/45">
            Variant A converts <b className="text-white">55% better</b>. Socially will favour this hook style in future drafts.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
