"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Sparkles, ArrowUpRight, RefreshCw, Loader2, ExternalLink, AtSign } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import type { SocialTrend, SocialAccount } from "@/lib/social/types";

type Acct = Pick<SocialAccount, "id" | "platform" | "handle" | "display_name">;

export function TrendsClient({ trends: initial, accounts, userNiche, persona }: {
  trends: SocialTrend[]; accounts: Acct[]; userNiche: string | null; persona: string;
}) {
  const { success, error: toastError } = useToast();
  const [trends, setTrends] = useState(initial);
  const [sel, setSel] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/social/trends", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTrends(data.trends ?? []);
      success("Trends refreshed", data.searched ? "From a live web search." : "Connect a search key for live web results.");
    } catch (e) { toastError("Couldn't refresh trends", e instanceof Error ? e.message : undefined); }
    finally { setBusy(false); }
  };

  const acctFor = (id: string | null) => accounts.find((a) => a.id === id);
  const momentumColor = (m: string | null) => (m === "Accelerating" ? "#34d399" : m === "Building" ? "var(--sai-gold)" : "var(--fg-3)");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Insights"
        title="Trend Predictor"
        sub={`Web-searched trends for ${persona}s${userNiche ? ` in ${userNiche}` : ""} — each referred to a connected account.`}
        actions={
          <button onClick={refresh} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2 text-[13px] text-[var(--fg)] hover:bg-[var(--hover)] disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh trends
          </button>
        }
      />

      {trends.length === 0 ? (
        <GlassCard className="flex flex-col items-center p-12 text-center">
          <TrendingUp className="mb-3 h-12 w-12 text-[var(--fg-4)]" />
          <p className="mb-1 font-medium text-[var(--fg-2)]">No trends yet</p>
          <p className="mb-4 text-sm text-[var(--fg-4)]">Refresh to run a web search for your niche.</p>
          <button onClick={refresh} disabled={busy} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Search trends now
          </button>
        </GlassCard>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            {trends.map((t, i) => {
              const acct = acctFor(t.suggested_account_id);
              return (
                <GlassCard key={t.id} onClick={() => setSel(i === sel ? null : i)} className="cursor-pointer p-5"
                  style={sel === i ? { borderColor: "rgba(99,102,241,0.45)" } : undefined}>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="mr-3 flex-1">
                      <h3 className="text-sm font-semibold text-[var(--fg)]">{t.topic}</h3>
                      {t.source_name && <div className="mt-1"><Pill tone="muted">{t.source_name}</Pill></div>}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-display text-2xl font-bold sai-gradient-text">{t.score ?? "—"}</div>
                      <div className="text-[12px] font-medium" style={{ color: momentumColor(t.momentum) }}>{t.momentum}</div>
                    </div>
                  </div>
                  {t.summary && <p className="rounded-md bg-[var(--panel-fill)] px-3 py-2 text-[12px] text-[var(--fg-3)]">{t.summary}</p>}
                  {acct && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--sai-indigo)]/25 bg-[var(--sai-indigo)]/10 px-3 py-2">
                      <AtSign className="h-3.5 w-3.5 text-[var(--sai-indigo)]" />
                      <span className="text-[12px] text-[var(--fg-2)]">Ride this on <b className="text-[var(--fg)]">{acct.platform}</b> · {acct.handle || acct.display_name}</span>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            {sel !== null && trends[sel] ? (
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--sai-gold)]" />
                  <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">{trends[sel].topic}</h3>
                  <span className="ml-auto"><Pill tone="indigo">Score {trends[sel].score}</Pill></span>
                </div>
                {trends[sel].summary && <p className="mb-4 text-sm leading-relaxed text-[var(--fg-2)]">{trends[sel].summary}</p>}
                {trends[sel].source_url && (
                  <a href={trends[sel].source_url!} target="_blank" rel="noreferrer" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-[var(--sai-indigo)] hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> Read source
                  </a>
                )}
                <Link href="/dashboard/create" className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                  <ArrowUpRight className="h-4 w-4" /> Draft a post from this
                </Link>
              </GlassCard>
            ) : (
              <GlassCard className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
                <TrendingUp className="mb-3 h-12 w-12 text-[var(--fg-4)]" />
                <p className="mb-1 font-medium text-[var(--fg-2)]">Select a trend</p>
                <p className="text-sm text-[var(--fg-4)]">See the source and draft a post for the right account.</p>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
