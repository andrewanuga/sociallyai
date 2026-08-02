"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Users, Eye, Heart, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { fmtNum, pctChange } from "@/lib/dashboard/helpers";
import type { SocialAccount, SocialPost } from "@/lib/social/types";
import type { SocialAccountMetric } from "@/lib/supabase/types";

export function AccountClient({
  account,
  posts,
  metrics,
}: {
  account: SocialAccount;
  posts: SocialPost[];
  metrics: SocialAccountMetric[];
}) {
  const [suggestions, setSuggestions] = useState<NonNullable<SocialAccountMetric["ai_suggestions"]> | null>(null);
  const [generating, setGenerating] = useState(false);

  const today = metrics[0] || { followers: account.followers, impressions: 0, engagements: 0 };
  const weekAgo = metrics.find(m => {
    const diff = new Date().getTime() - new Date(m.date).getTime();
    return diff >= 7 * 24 * 60 * 60 * 1000;
  }) || metrics[metrics.length - 1] || { followers: account.followers, impressions: 0, engagements: 0 };

  const followerChange = pctChange(today.followers, weekAgo.followers);
  const imprChange = pctChange(today.impressions, weekAgo.impressions);
  const engChange = pctChange(today.engagements, weekAgo.engagements);

  useEffect(() => {
    async function loadSuggestions() {
      // Check if we already have valid suggestions generated in the last 24h
      const latest = metrics[0];
      if (latest?.ai_suggestions && latest.ai_generated_at) {
        const genDate = new Date(latest.ai_generated_at).getTime();
        const now = new Date().getTime();
        if (now - genDate < 24 * 60 * 60 * 1000) {
          setSuggestions(latest.ai_suggestions);
          return;
        }
      }

      // Generate new suggestions
      setGenerating(true);
      try {
        const res = await fetch(`/api/social/accounts/${account.id}/suggestions`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setGenerating(false);
      }
    }
    loadSuggestions();
  }, [account.id, metrics]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-[13px] text-[var(--sai-indigo)] hover:text-indigo-400">
          <ArrowLeft className="h-4 w-4" /> Back to Overview
        </Link>
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0">
            {account.avatar_url ? (
              <img src={account.avatar_url} alt="" className="h-full w-full rounded-full object-cover ring-4 ring-[var(--panel-fill)]" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--panel-fill-2)] text-[20px] font-bold text-[var(--fg-3)]">
                {(account.display_name || account.handle || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-[26px] font-semibold text-[var(--fg)]">
              {account.display_name || account.handle}
            </h1>
            <p className="text-[14px] text-[var(--fg-4)] capitalize">{account.platform}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34d399]/10">
              <Users className="h-4 w-4 text-[#34d399]" />
            </span>
            {followerChange.change !== "—" && (
              <span className="font-data flex items-center gap-0.5 text-[12px]" style={{ color: followerChange.positive ? "#34d399" : "var(--sai-red)" }}>
                {followerChange.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{followerChange.change}
              </span>
            )}
          </div>
          <div className="font-display mt-3 text-2xl font-semibold text-[var(--fg)]">{fmtNum(today.followers)}</div>
          <div className="mt-0.5 text-[13px] text-[var(--fg-3)]">Followers</div>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sai-indigo)]/10">
              <Eye className="h-4 w-4 text-[var(--sai-indigo)]" />
            </span>
            {imprChange.change !== "—" && (
              <span className="font-data flex items-center gap-0.5 text-[12px]" style={{ color: imprChange.positive ? "#34d399" : "var(--sai-red)" }}>
                {imprChange.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{imprChange.change}
              </span>
            )}
          </div>
          <div className="font-display mt-3 text-2xl font-semibold text-[var(--fg)]">{fmtNum(today.impressions)}</div>
          <div className="mt-0.5 text-[13px] text-[var(--fg-3)]">Impressions</div>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sai-violet)]/10">
              <Heart className="h-4 w-4 text-[var(--sai-violet)]" />
            </span>
            {engChange.change !== "—" && (
              <span className="font-data flex items-center gap-0.5 text-[12px]" style={{ color: engChange.positive ? "#34d399" : "var(--sai-red)" }}>
                {engChange.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{engChange.change}
              </span>
            )}
          </div>
          <div className="font-display mt-3 text-2xl font-semibold text-[var(--fg)]">{fmtNum(today.engagements)}</div>
          <div className="mt-0.5 text-[13px] text-[var(--fg-3)]">Engagements</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel relative overflow-hidden rounded-2xl p-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--sai-indigo)]/20 blur-3xl"></div>
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--sai-indigo)]" />
            <h2 className="font-display text-[16px] font-semibold text-[var(--fg)]">AI Daily Insights</h2>
          </div>

          {generating ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--sai-indigo)]" />
              <p className="mt-3 text-sm text-[var(--fg-3)]">Analyzing analytics & generating insights...</p>
            </div>
          ) : !suggestions ? (
            <p className="py-4 text-sm text-[var(--fg-4)]">No insights available right now.</p>
          ) : (
            <div className="space-y-4 relative z-10">
              {suggestions.map((s, i) => (
                <div key={i} className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 shadow-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: s.type === "growth" ? "#34d399" : s.type === "warning" ? "var(--sai-red)" : "var(--sai-gold)" }}></span>
                    <h3 className="text-[14px] font-semibold text-[var(--fg)]">{s.title}</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[var(--fg-3)]">{s.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-display mb-5 text-[16px] font-semibold text-[var(--fg)]">Recent Posts</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-[var(--fg-4)]">No recent posts found for this account.</p>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="flex flex-col gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">
                  <p className="text-[13px] text-[var(--fg-2)] line-clamp-2">{post.content || "No content"}</p>
                  <div className="flex items-center gap-4 text-[11px] font-medium text-[var(--fg-4)]">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {fmtNum(post.impressions)}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {fmtNum(post.likes)}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {fmtNum(post.comments)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
