import { redirect } from "next/navigation";
import {
  TrendingUp, TrendingDown, Eye, Heart, Users,
  MousePointerClick, DollarSign, ArrowUpRight,
  Zap, Ghost, Bot, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo, fmtNum, fmtNaira, pctChange, sumField, platformLabel, daysAgoISO } from "@/lib/dashboard/helpers";

/* ── action type → visual config ─────────────────────────────── */
const ACTION_META = {
  auto_reply:         { icon: Bot,         color: "text-green-400", bg: "bg-green-500/10", label: "Auto-replied" },
  flag_lead:          { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", label: "Lead flagged" },
  escalate_complaint: { icon: AlertCircle, color: "text-red-500",   bg: "bg-red-600/10",   label: "Escalated"   },
  ignore:             { icon: Bot,         color: "text-muted-foreground", bg: "bg-muted", label: "Ignored"     },
} as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    { label: "Total Impressions", value: fmtNum(totals.impressions),     icon: Eye,               color: "text-sky-400",     bg: "bg-sky-500/10",     ...pctChange(totals.impressions, prevTotals.impressions) },
    { label: "Engagements",       value: fmtNum(totals.engagements),     icon: Heart,             color: "text-indigo-400",     bg: "bg-red-500/10",     ...pctChange(totals.engagements, prevTotals.engagements) },
    { label: "New Followers",     value: `+${fmtNum(totals.followers)}`, icon: Users,             color: "text-emerald-400", bg: "bg-emerald-500/10", ...pctChange(totals.followers,   prevTotals.followers)   },
    { label: "Link Clicks",       value: fmtNum(totals.clicks),          icon: MousePointerClick, color: "text-violet-400",  bg: "bg-violet-500/10",  ...pctChange(totals.clicks,     prevTotals.clicks)      },
    { label: "Est. Revenue",      value: fmtNaira(totals.revenue),       icon: DollarSign,        color: "text-emerald-400", bg: "bg-emerald-500/10", ...pctChange(totals.revenue,    prevTotals.revenue)     },
  ];

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Last 30 days across all connected accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="red" className="gap-1.5">
            <span className={`w-2 h-2 rounded-full ${ghostActive ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
            Ghost Mode {ghostActive ? "Active" : "Inactive"}
          </Badge>
          <Link href="/dashboard/compose">
            <Button variant="gradient" size="sm" className="gap-2">
              <Zap className="w-4 h-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border bg-card hover:border-white/10 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${m.positive ? "text-green-400" : "text-indigo-400"}`}>
                {m.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.change === "—" ? "" : m.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-0.5">{m.value || "—"}</div>
            <div className="text-xs text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Platform breakdown */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4">Platform Breakdown</h3>
          {platforms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts in the last 30 days.</p>
          ) : (
            <div className="space-y-4">
              {platforms.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-muted-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{fmtNum(p.impressions)} impr.</span>
                  </div>
                  <Progress value={p.pct} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top posts */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Performing Posts</h3>
            <Link href="/dashboard/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all
            </Link>
          </div>
          {(!posts || posts.length === 0) ? (
            <p className="text-sm text-muted-foreground">No post data yet. Schedule your first post!</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold gradient-text">{post.socially_score ?? "—"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.content ?? "No content"}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{platformLabel(post.platform)}</span>
                      <span>•</span>
                      <span>{fmtNum(post.impressions)} views</span>
                      <span>•</span>
                      <span>{post.engagements > 0 ? `${((post.engagements / Math.max(post.impressions, 1)) * 100).toFixed(1)}%` : "0%"} eng.</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400 flex-shrink-0">
                    {post.revenue_attributed > 0 ? fmtNaira(post.revenue_attributed) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ghost Mode log */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ghost className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold">Ghost Mode Agent Log</h3>
            </div>
            <Link href="/dashboard/ghost-mode" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Manage
            </Link>
          </div>
          {(!acts || acts.length === 0) ? (
            <p className="text-sm text-muted-foreground">No agent actions yet. Enable Ghost Mode to start.</p>
          ) : (
            <div className="space-y-3">
              {acts.map((entry) => {
                const meta = ACTION_META[entry.action as keyof typeof ACTION_META] ?? ACTION_META.ignore;
                const Icon = meta.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className={`w-7 h-7 rounded-md ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">&ldquo;{entry.comment}&rdquo;</p>
                      <p className={`text-xs font-medium mt-0.5 ${meta.color}`}>{meta.label}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(entry.created_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trend predictor */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold">Trend Predictor</h3>
            </div>
            <Link href="/dashboard/trends" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all
            </Link>
          </div>
          {(!trnds || trnds.length === 0) ? (
            <p className="text-sm text-muted-foreground">No trends cached yet. Visit the Trends page to fetch them.</p>
          ) : (
            <div className="space-y-3">
              {trnds.map((trend, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-muted/20 hover:border-indigo-500/20 transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium group-hover:text-foreground transition-colors">{trend.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{trend.category}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold gradient-text">{trend.score}</span>
                      <span className="text-xs text-green-400 font-medium">{trend.growth}</span>
                    </div>
                  </div>
                  <Link href="/dashboard/trends">
                    <Button size="sm" variant="outline" className="w-full text-xs h-7 gap-1.5 hover:border-red-500/30 hover:text-indigo-400 transition-colors">
                      <ArrowUpRight className="w-3 h-3" />
                      Draft post from this trend
                    </Button>
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
