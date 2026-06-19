import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import { fmtNum, fmtNaira, pctChange, sumField, platformLabel, daysAgoISO } from "@/lib/dashboard/helpers";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const d30 = daysAgoISO(30);
  const d60 = daysAgoISO(60);

  const [
    { data: curr },
    { data: prev },
    { data: topPosts },
    { data: roiClicks },
  ] = await Promise.all([
    /* Per-post data for current 30 days */
    supabase.from("post_history")
      .select("platform, impressions, engagements, followers_gained, revenue_attributed, socially_score")
      .gte("posted_at", d30),

    /* Prior 30 days for growth % */
    supabase.from("post_history")
      .select("platform, impressions, engagements, followers_gained")
      .gte("posted_at", d60).lt("posted_at", d30),

    /* Top 5 posts by socially_score */
    supabase.from("post_history")
      .select("content, platform, impressions, engagements, socially_score, revenue_attributed, posted_at")
      .gte("posted_at", d30)
      .order("socially_score", { ascending: false })
      .limit(5),

    /* ROI clicks */
    supabase.from("roi_clicks")
      .select("converted, revenue")
      .gte("clicked_at", d30),
  ]);

  /* ── Per-platform aggregation ───────────────────────────────── */
  type PlatRow = { platform: string; impressions: number; engagements: number; followers_gained: number };
  function groupByPlatform(rows: PlatRow[] | null) {
    const map: Record<string, { impressions: number; engagements: number; followers: number; count: number }> = {};
    rows?.forEach(r => {
      if (!map[r.platform]) map[r.platform] = { impressions: 0, engagements: 0, followers: 0, count: 0 };
      map[r.platform].impressions  += r.impressions  || 0;
      map[r.platform].engagements  += r.engagements  || 0;
      map[r.platform].followers    += r.followers_gained || 0;
      map[r.platform].count++;
    });
    return map;
  }

  const currMap = groupByPlatform(curr as PlatRow[]);
  const prevMap = groupByPlatform(prev as PlatRow[]);

  const platformStats = Object.entries(currMap)
    .map(([platform, c]) => {
      const p = prevMap[platform] ?? { impressions: 0, engagements: 0, followers: 0 };
      const { change, positive } = pctChange(c.impressions, p.impressions);
      return {
        name:        platformLabel(platform),
        letter:      platform === "x" ? "X" : platform === "linkedin" ? "in" : platform === "instagram" ? "IG" : platform.slice(0, 2).toUpperCase(),
        impressions: fmtNum(c.impressions),
        engagements: fmtNum(c.engagements),
        followers:   `+${fmtNum(c.followers)}`,
        growth:      change,
        positive,
      };
    })
    .sort((a, b) => {
      // sort by raw impressions (parse back roughly)
      return parseInt(b.impressions) - parseInt(a.impressions);
    });

  /* ── ROI aggregation ────────────────────────────────────────── */
  const totalClicks      = roiClicks?.length ?? 0;
  const totalConversions = roiClicks?.filter(r => r.converted).length ?? 0;
  const totalRevenue     = sumField(roiClicks, "revenue");
  const convRate         = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) + "%" : "0%";

  /* ── Overall aggregates for top posts ──────────────────────── */
  const totalImpressionsAll = sumField(curr, "impressions");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-foreground" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">30-day performance across all connected accounts</p>
      </div>

      {/* Platform breakdown */}
      {platformStats.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-border bg-card/50 text-center mb-6">
          <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No post data yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Start scheduling posts to see platform analytics here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {platformStats.map((p, i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-muted-foreground">{p.letter}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${p.positive ? "text-green-400" : "text-red-400"}`}>
                  {p.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {p.growth}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold">{p.impressions}</p>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{p.engagements}</p>
                  <p className="text-xs text-muted-foreground">Engagements</p>
                </div>
                <div className="col-span-2">
                  <p className="text-lg font-bold text-green-400">{p.followers}</p>
                  <p className="text-xs text-muted-foreground">New followers</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROI Pulse summary */}
      <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold">ROI Pulse — Revenue Attribution</h3>
          </div>
          <Badge variant="red">Active tracking</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Attributed Revenue",  value: fmtNaira(totalRevenue),                          color: "text-emerald-400" },
            { label: "Total Link Clicks",   value: totalClicks.toLocaleString(),                     color: "text-foreground"  },
            { label: "Conversions",         value: totalConversions.toLocaleString(),                 color: "text-green-400"   },
            { label: "Avg Conversion Rate", value: convRate,                                          color: "text-foreground"  },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top posts by Socially Score */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Top Posts by Socially Score™</h3>
        {(!topPosts || topPosts.length === 0) ? (
          <p className="text-sm text-muted-foreground">No posts recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {topPosts.map((p, i) => {
              const engPct = p.impressions > 0
                ? ((p.engagements / p.impressions) * 100).toFixed(1) + "%"
                : "0%";
              const pct = totalImpressionsAll > 0
                ? Math.round((p.impressions / totalImpressionsAll) * 100)
                : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-muted-foreground flex-shrink-0 truncate">
                    {platformLabel(p.platform)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground truncate mb-1">{p.content}</p>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <div className="flex items-center gap-6 text-sm flex-shrink-0">
                    <span className="font-bold gradient-text">{p.socially_score ?? "—"}</span>
                    <span className="text-muted-foreground w-16 text-right">{fmtNum(p.impressions)} views</span>
                    <span className="text-foreground/70 w-12 text-right">{engPct}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
