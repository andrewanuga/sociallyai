"use client";

import { useState } from "react";
import { TrendingUp, Sparkles, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import type { Trend } from "@/lib/supabase/types";

export function TrendsClient({ trends: initialTrends, userNiche }: { trends: Trend[]; userNiche: string | null }) {
  const [trends, setTrends] = useState(initialTrends);
  const [selectedTrend, setSelected] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/ai/trends", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: userNiche ?? "General" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.trends)) setTrends(data.trends);
      }
    } catch { /* silent */ } finally { setRefreshing(false); }
  };

  const momentumColor = (m: string | null) =>
    !m ? "rgba(255,255,255,0.5)"
    : ["Accelerating", "Rising fast"].includes(m) ? "#34d399"
    : ["Steady", "Building"].includes(m) ? "var(--sai-gold)"
    : "rgba(255,255,255,0.5)";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Insights"
        title="Trend Predictor"
        sub="AI-matched trending topics with personalised drafts based on your history."
        actions={
          <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[13px] text-white/80 hover:bg-white/[0.08] disabled:opacity-60">
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh trends
          </button>
        }
      />

      {trends.length === 0 ? (
        <GlassCard className="flex flex-col items-center p-12 text-center">
          <TrendingUp className="mb-3 h-12 w-12 text-white/15" />
          <p className="mb-1 font-medium text-white/70">No trends cached yet</p>
          <p className="mb-4 text-sm text-white/40">Fetch AI-matched topics for your niche.</p>
          <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Fetch trends now
          </button>
        </GlassCard>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            {trends.map((trend, i) => (
              <GlassCard key={trend.id} onClick={() => setSelected(i === selectedTrend ? null : i)} className="cursor-pointer p-5"
                style={selectedTrend === i ? { borderColor: "rgba(99,102,241,0.45)", boxShadow: "0 20px 60px -34px rgba(99,102,241,0.9)" } : undefined}>
                <div className="mb-3 flex items-start justify-between">
                  <div className="mr-3 flex-1">
                    <h3 className="text-sm font-semibold text-white">{trend.topic}</h3>
                    {trend.category && <div className="mt-1"><Pill tone="muted">{trend.category}</Pill></div>}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="font-display text-2xl font-bold sai-gradient-text">{trend.score ?? "—"}</div>
                    <div className="text-[12px] font-medium" style={{ color: "#34d399" }}>{trend.growth}</div>
                  </div>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-medium" style={{ color: momentumColor(trend.momentum) }}>● {trend.momentum ?? "Unknown"}</span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${trend.score ?? 0}%`, background: "linear-gradient(90deg,#6366f1,#a855f7)" }} /></div>
                </div>
                {trend.why && <p className="rounded-md bg-white/[0.03] px-3 py-2 text-[12px] text-white/50">💡 {trend.why}</p>}
              </GlassCard>
            ))}
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedTrend !== null && trends[selectedTrend] ? (
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--sai-gold)]" />
                  <h3 className="font-display text-[15px] font-semibold text-white">AI-generated draft</h3>
                  <span className="ml-auto"><Pill tone="indigo">Score {trends[selectedTrend].score}</Pill></span>
                </div>
                <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{trends[selectedTrend].draft ?? "No draft available. Regenerate to create one."}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}><ArrowUpRight className="h-4 w-4" /> Send to Composer</button>
                  <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08] disabled:opacity-60"><RefreshCw className="h-4 w-4" /> Regenerate</button>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                <TrendingUp className="mb-3 h-12 w-12 text-white/15" />
                <p className="mb-1 font-medium text-white/70">Select a trend</p>
                <p className="text-sm text-white/40">Click any card to see an AI draft ready to edit and post.</p>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
