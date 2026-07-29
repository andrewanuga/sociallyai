"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Eye, Heart, DollarSign, FileText, ArrowUpRight, FlaskConical, Trophy, Plug, Megaphone, Sparkles } from "lucide-react";
import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";
import { fmtNum, fmtNaira, platformLabel } from "@/lib/dashboard/helpers";
import type { SocialPost, Campaign } from "@/lib/social/types";

function AreaChart({ data, color = "#6366f1", height = 150 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) data = [...data, ...data, 0].slice(0, 2);
  const w = 560, h = height, pad = 6;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const gid = `g-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L${x(data.length - 1)},${h} L${x(0)},${h} Z`} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const engOf = (p: SocialPost) => p.likes + p.comments + p.shares + p.saves;

export function AnalyticsClient({ persona, posts, campaigns, connectedCount }: {
  persona: string; posts: SocialPost[]; campaigns: Campaign[]; connectedCount: number;
}) {
  const hasData = posts.length > 0 || campaigns.length > 0;

  const totals = useMemo(() => {
    const impr = posts.reduce((a, p) => a + p.impressions, 0);
    const eng = posts.reduce((a, p) => a + engOf(p), 0);
    const rev = posts.reduce((a, p) => a + Number(p.revenue), 0);
    return { impr, eng, rev, rate: impr ? (eng / impr) * 100 : 0, count: posts.length };
  }, [posts]);

  // Impressions bucketed by day.
  const series = useMemo(() => {
    const byDay: Record<string, number> = {};
    posts.forEach((p) => { const d = (p.posted_at || "").slice(0, 10); byDay[d] = (byDay[d] ?? 0) + p.impressions; });
    return Object.keys(byDay).sort().map((k) => byDay[k]);
  }, [posts]);

  // Engagement per platform.
  const byPlatform = useMemo(() => {
    const m: Record<string, number> = {};
    posts.forEach((p) => { m[p.platform] = (m[p.platform] ?? 0) + engOf(p); });
    const max = Math.max(...Object.values(m), 1);
    return Object.entries(m).map(([k, v]) => ({ name: platformLabel(k), pct: Math.round((v / max) * 100), value: v })).sort((a, b) => b.value - a.value);
  }, [posts]);

  const avgEng = totals.count ? totals.eng / totals.count : 0;
  const bestPlatform = byPlatform[0]?.name;

  const topContent = useMemo(() => [...posts].sort((a, b) => engOf(b) - engOf(a)).slice(0, 4), [posts]);

  const campaignRec = (c: Campaign) =>
    c.ai_recommendation ||
    (c.ctr < 1 ? "CTR under 1% — tighten targeting and refresh the creative."
      : c.roas >= 3 ? "Strong ROAS — scale the daily budget 20–30%."
      : c.conversions === 0 ? "No conversions yet — check the landing page and offer."
      : "Steady — A/B test a new hook to lift CTR.");

  if (connectedCount === 0 && !hasData) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="Insights" title="Analytics" sub="Real numbers per account and per post — once you connect." />
        <GlassCard className="flex flex-col items-center p-12 text-center">
          <Plug className="mb-3 h-10 w-10 text-[var(--fg-4)]" />
          <p className="font-medium text-[var(--fg-2)]">No analytics yet</p>
          <p className="mt-1 text-[13px] text-[var(--fg-4)]">Connect an account and run Sync to populate this page.</p>
          <Link href="/dashboard/integrations" className="mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Connect an account</Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Insights" title="Analytics" sub="Understand what's working — per account and per post — and where to take it next." />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Impressions" value={fmtNum(totals.impr)} icon={Eye} tone="indigo" />
        <StatTile label="Engagement rate" value={`${totals.rate.toFixed(1)}%`} icon={Heart} tone="violet" />
        <StatTile label="Revenue" value={fmtNaira(totals.rev)} icon={DollarSign} tone="gold" />
        <StatTile label="Posts (30d)" value={String(totals.count)} icon={FileText} tone="green" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <GlassCard className="p-5">
          <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Impressions over time</p>
          {series.length ? <div className="mt-4"><AreaChart data={series} /></div> : <p className="mt-4 text-sm text-[var(--fg-4)]">No posts in range.</p>}
        </GlassCard>
        <GlassCard className="p-5">
          <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Engagement by platform</p>
          {byPlatform.length ? (
            <div className="mt-5 space-y-4">
              {byPlatform.map((p) => (
                <div key={p.name}>
                  <div className="mb-1.5 flex items-center justify-between text-[12.5px]"><span className="text-[var(--fg-2)]">{p.name}</span><span className="font-data text-[var(--fg-4)]">{fmtNum(p.value)}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-fill-2)]"><div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: "linear-gradient(90deg,#6366f1,#a855f7)" }} /></div>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 text-sm text-[var(--fg-4)]">No data yet.</p>}
        </GlassCard>
      </div>

      {/* Creator: per-post analytics + referral */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--sai-indigo)]" />
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-[var(--fg-3)]">Per-post analytics {persona === "creator" && <span className="text-[var(--sai-indigo)]">· for you</span>}</p>
        </div>
        {topContent.length === 0 ? (
          <GlassCard className="p-6 text-sm text-[var(--fg-4)]">No posts to analyze yet.</GlassCard>
        ) : (
          <div className="space-y-3">
            {topContent.map((c) => {
              const referral = c.referral_platform ? platformLabel(c.referral_platform) : (bestPlatform && bestPlatform !== platformLabel(c.platform) ? bestPlatform : null);
              const lift = avgEng ? (engOf(c) / avgEng) : 1;
              return (
                <GlassCard key={c.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Pill tone="indigo">{platformLabel(c.platform)}</Pill>
                    <p className="min-w-0 flex-1 truncate text-[14px] text-[var(--fg)]">{c.content ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right"><p className="font-data text-[13px] text-[var(--fg)]">{fmtNum(c.impressions)}</p><p className="text-[11px] text-[var(--fg-4)]">impressions</p></div>
                    <div className="text-right"><p className="font-data text-[13px] text-[var(--fg)]">{c.engagement_rate}%</p><p className="text-[11px] text-[var(--fg-4)]">engagement</p></div>
                    {referral && (
                      <div className="flex items-center gap-2 rounded-xl border border-[var(--sai-indigo)]/25 bg-[var(--sai-indigo)]/10 px-3 py-2">
                        <ArrowUpRight className="h-4 w-4 text-[var(--sai-indigo)]" />
                        <span className="text-[12px] text-[var(--fg-2)]"><b className="text-[var(--fg)]">{lift.toFixed(1)}×</b> avg — repost to <b className="text-[var(--fg)]">{referral}</b>?</span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Marketer: per-campaign board + recommendation */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[var(--sai-gold)]" />
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-[var(--fg-3)]">Campaigns {persona === "marketer" && <span className="text-[var(--sai-gold)]">· for you</span>}</p>
        </div>
        {campaigns.length === 0 ? (
          <GlassCard className="p-6 text-sm text-[var(--fg-4)]">No campaigns yet. Connect an ad account to see campaign boards here.</GlassCard>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {campaigns.map((c) => (
              <GlassCard key={c.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">{c.name}</h3>
                    {c.ab_variant && <Pill tone="violet"><FlaskConical className="h-3 w-3" /> {c.ab_variant}</Pill>}
                  </div>
                  <Pill tone={c.status === "active" ? "green" : "muted"}>{c.status}</Pill>
                </div>
                <p className="mt-1 text-[12px] text-[var(--fg-4)]">{platformLabel(c.platform)} · {c.objective ?? "—"}</p>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {[
                    { l: "Spend", v: fmtNaira(c.spend) },
                    { l: "CTR", v: `${Number(c.ctr).toFixed(1)}%` },
                    { l: "Conv.", v: fmtNum(c.conversions) },
                    { l: "ROAS", v: `${Number(c.roas).toFixed(1)}×` },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg bg-[var(--panel-fill)] p-2"><p className="font-data text-[13px] text-[var(--fg)]">{s.v}</p><p className="text-[10px] text-[var(--fg-4)]">{s.l}</p></div>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--sai-gold)]/20 bg-[var(--sai-gold)]/[0.06] p-3">
                  <Trophy className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--sai-gold)]" />
                  <p className="text-[12.5px] text-[var(--fg-2)]">{campaignRec(c)}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
