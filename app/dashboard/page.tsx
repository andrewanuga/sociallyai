import { redirect } from "next/navigation";
import {
  TrendingUp, TrendingDown, Eye, Heart, Users,
  MousePointerClick, DollarSign, ArrowUpRight,
  Zap, Ghost, Bot, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo, fmtNum, fmtNaira, pctChange, sumField, platformLabel, daysAgoISO } from "@/lib/dashboard/helpers";

/* ── action type → visual config ─────────────────────────────── */
const ACTION_META = {
  auto_reply:         { icon: Bot,         color: "#34d399",             label: "Auto-replied"  },
  flag_lead:          { icon: AlertCircle, color: "var(--sai-gold)",     label: "Lead flagged"  },
  escalate_complaint: { icon: AlertCircle, color: "var(--sai-red)",      label: "Escalated"     },
  ignore:             { icon: Bot,         color: "var(--fg-3)",label: "Ignored"       },
} as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // New users must finish onboarding before entering the workspace.
  const { data: onboardProfile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();
  if (onboardProfile && !onboardProfile.onboarded) redirect("/onboarding");

  const d30 = daysAgoISO(30);
  const d60 = daysAgoISO(60);
  const now  = new Date().toISOString();

  /* ── Parallel data fetching ─────────────────────────────────── */
  const [
    { data: curr  },
    { data: prev  },
    { data: posts },
    { data: acts  },
    { data: trnds },
    { data: agentToday },
  ] = await Promise.all([
    /* Current 30-day post history */
    supabase.from("post_history")
      .select("platform, impressions, engagements, followers_gained, link_clicks, revenue_attributed")
      .gte("posted_at", d30),

    /* Prior 30-day post history (for % change) */
    supabase.from("post_history")
      .select("impressions, engagements, followers_gained, link_clicks, revenue_attributed")
      .gte("posted_at", d60).lt("posted_at", d30),

    /* Top 3 posts by impressions */
    supabase.from("post_history")
      .select("content, platform, impressions, engagements, revenue_attributed, socially_score")
      .gte("posted_at", d30)
      .order("impressions", { ascending: false })
      .limit(3),

    /* Recent agent actions */
    supabase.from("agent_actions")
      .select("id, action, comment, reply, platform, created_at")
      .order("created_at", { ascending: false })
      .limit(4),

    /* Live trend cache */
    supabase.from("trends")
      .select("topic, category, score, growth")
      .gt("expires_at", now)
      .order("score", { ascending: false })
      .limit(3),

    /* Today's agent actions (for active status) */
    supabase.from("agent_actions")
      .select("id")
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  /* ── Aggregated metrics ─────────────────────────────────────── */
  const totals = {
    impressions: sumField(curr, "impressions"),
    engagements: sumField(curr, "engagements"),
    followers:   sumField(curr, "followers_gained"),
    clicks:      sumField(curr, "link_clicks"),
    revenue:     sumField(curr, "revenue_attributed"),
  };
  const prevTotals = {
    impressions: sumField(prev, "impressions"),
    engagements: sumField(prev, "engagements"),
    followers:   sumField(prev, "followers_gained"),
    clicks:      sumField(prev, "link_clicks"),
    revenue:     sumField(prev, "revenue_attributed"),
  };

  /* ── Platform breakdown ─────────────────────────────────────── */
  const platformMap: Record<string, number> = {};
  curr?.forEach(r => {
    const key = platformLabel(r.platform);
    platformMap[key] = (platformMap[key] ?? 0) + (r.impressions || 0);
  });
  const maxImpr  = Math.max(...Object.values(platformMap), 1);
  const platforms = Object.entries(platformMap)
    .map(([name, impressions]) => ({ name, impressions, pct: Math.round((impressions / maxImpr) * 100) }))
    .sort((a, b) => b.impressions - a.impressions);

  /* ── Ghost Mode active ──────────────────────────────────────── */
  const ghostActive = (agentToday?.length ?? 0) > 0;

  /* ── Top metrics cards config ───────────────────────────────── */
  const metrics = [
    { label: "Impressions",   value: fmtNum(totals.impressions),     icon: Eye,               color: "var(--sai-indigo)", ...pctChange(totals.impressions, prevTotals.impressions) },
    { label: "Engagements",   value: fmtNum(totals.engagements),     icon: Heart,             color: "var(--sai-violet)", ...pctChange(totals.engagements, prevTotals.engagements) },
    { label: "New followers", value: `+${fmtNum(totals.followers)}`, icon: Users,             color: "#34d399",           ...pctChange(totals.followers,   prevTotals.followers)   },
    { label: "Link clicks",   value: fmtNum(totals.clicks),          icon: MousePointerClick, color: "var(--sai-gold)",   ...pctChange(totals.clicks,     prevTotals.clicks)      },
    { label: "Est. revenue",  value: fmtNaira(totals.revenue),       icon: DollarSign,        color: "#34d399",           ...pctChange(totals.revenue,    prevTotals.revenue)     },
  ];

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-data text-[11px] uppercase tracking-[0.22em] text-[var(--sai-indigo)]">Last 30 days</span>
          <h1 className="font-display mt-1.5 text-[26px] font-semibold tracking-[-0.02em] text-[var(--fg)] sm:text-[30px]">Overview</h1>
          <p className="mt-1.5 text-sm text-[var(--fg-3)]">Everything across your connected accounts, at a glance.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className="font-data inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider"
            style={{ color: ghostActive ? "#34d399" : "var(--fg-3)", background: ghostActive ? "color-mix(in srgb,#34d399 13%,transparent)" : "var(--panel-fill-2)" }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: ghostActive ? "#34d399" : "var(--fg-4)" }} />
            Ghost Mode {ghostActive ? "Active" : "Idle"}
          </span>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-[var(--fg)] transition-transform hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 26px -10px rgba(99,102,241,0.8)" }}
          >
            <Zap className="h-4 w-4" /> New post
          </Link>
        </div>
      </div>

      {/* Metrics row */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${m.color} 16%, transparent)` }}>
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
              </span>
              {m.change !== "—" && (
                <span className="font-data flex items-center gap-0.5 text-[12px]" style={{ color: m.positive ? "#34d399" : "var(--sai-red)" }}>
                  {m.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {m.change}
                </span>
              )}
            </div>
            <div className="font-display mt-3 text-2xl font-semibold text-[var(--fg)]">{m.value || "—"}</div>
            <div className="mt-0.5 text-[13px] text-[var(--fg-3)]">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Platform breakdown */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Platform breakdown</h3>
          {platforms.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--fg-4)]">No posts in the last 30 days.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {platforms.map((p, i) => (
                <div key={i}>
                  <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                    <span className="text-[var(--fg-2)]">{p.name}</span>
                    <span className="font-data text-[var(--fg-4)]">{fmtNum(p.impressions)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-fill-2)]">
                    <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: "linear-gradient(90deg,#6366f1,#a855f7)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top posts */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Top performing posts</h3>
            <Link href="/dashboard/analytics" className="text-[12.5px] text-[var(--sai-indigo)] transition-colors hover:text-indigo-300">View all</Link>
          </div>
          {(!posts || posts.length === 0) ? (
            <p className="text-sm text-[var(--fg-4)]">No post data yet. Schedule your first post.</p>
          ) : (
            <div className="space-y-2">
              {posts.map((post, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-[var(--hover)]">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--sai-indigo)]/25 bg-[var(--sai-indigo)]/10">
                    <span className="font-data text-[13px] font-bold sai-gradient-text">{post.socially_score ?? "—"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[var(--fg)]">{post.content ?? "No content"}</p>
                    <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--fg-4)]">
                      <span>{platformLabel(post.platform)}</span><span>·</span>
                      <span>{fmtNum(post.impressions)} views</span><span>·</span>
                      <span>{post.engagements > 0 ? `${((post.engagements / Math.max(post.impressions, 1)) * 100).toFixed(1)}%` : "0%"} eng.</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-sm font-semibold" style={{ color: "#34d399" }}>
                    {post.revenue_attributed > 0 ? fmtNaira(post.revenue_attributed) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Ghost Mode log */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ghost className="h-5 w-5 text-[var(--sai-violet)]" />
              <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Ghost Mode log</h3>
            </div>
            <Link href="/dashboard/ghost-mode" className="text-[12.5px] text-[var(--sai-indigo)] transition-colors hover:text-indigo-300">Manage</Link>
          </div>
          {(!acts || acts.length === 0) ? (
            <p className="text-sm text-[var(--fg-4)]">No agent actions yet. Deploy a bot to start.</p>
          ) : (
            <div className="space-y-2.5">
              {acts.map((entry) => {
                const meta = ACTION_META[entry.action as keyof typeof ACTION_META] ?? ACTION_META.ignore;
                const Icon = meta.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${meta.color} 16%, transparent)` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] text-[var(--fg-2)]">&ldquo;{entry.comment}&rdquo;</p>
                      <p className="mt-0.5 text-[12px] font-medium" style={{ color: meta.color }}>{meta.label}</p>
                    </div>
                    <span className="flex-shrink-0 text-[11px] text-[var(--fg-4)]">{timeAgo(entry.created_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trend predictor */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--sai-indigo)]" />
              <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Trend predictor</h3>
            </div>
            <Link href="/dashboard/trends" className="text-[12.5px] text-[var(--sai-indigo)] transition-colors hover:text-indigo-300">View all</Link>
          </div>
          {(!trnds || trnds.length === 0) ? (
            <p className="text-sm text-[var(--fg-4)]">No trends cached yet. Visit Trends to fetch them.</p>
          ) : (
            <div className="space-y-2.5">
              {trnds.map((trend, i) => (
                <div key={i} className="group rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 transition-colors hover:border-[var(--sai-indigo)]/25">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">{trend.topic}</p>
                      <p className="mt-0.5 text-[12px] text-[var(--fg-4)]">{trend.category}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-data text-[12px] font-bold sai-gradient-text">{trend.score}</span>
                      <span className="text-[12px] font-medium" style={{ color: "#34d399" }}>{trend.growth}</span>
                    </div>
                  </div>
                  <Link href="/dashboard/trends" className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] py-1.5 text-[12px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]">
                    <ArrowUpRight className="h-3 w-3" /> Draft from this trend
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
