import { redirect } from "next/navigation";
import {
  TrendingUp, TrendingDown, Eye, Heart, Users, DollarSign,
  ArrowUpRight, Zap, Megaphone, Inbox as InboxIcon, Plug,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtNum, fmtNaira, pctChange, sumField, platformLabel, daysAgoISO } from "@/lib/dashboard/helpers";
import { SyncButton } from "@/components/dashboard/SyncButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: onboardProfile } = await supabase
    .from("profiles").select("onboarded").eq("id", user.id).single();
  if (onboardProfile && !onboardProfile.onboarded) redirect("/onboarding");

  const d30 = daysAgoISO(30);
  const d60 = daysAgoISO(60);

  const [
    { data: accounts },
    { data: curr },
    { data: prev },
    { data: topPosts },
    { data: leads },
    { data: campaigns },
  ] = await Promise.all([
    supabase.from("social_accounts").select("platform, followers, status"),
    supabase.from("social_posts")
      .select("platform, impressions, likes, comments, shares, followers_gained, revenue")
      .gte("posted_at", d30),
    supabase.from("social_posts")
      .select("impressions, likes, comments, shares, followers_gained, revenue")
      .gte("posted_at", d60).lt("posted_at", d30),
    supabase.from("social_posts")
      .select("content, platform, impressions, likes, comments, revenue")
      .order("impressions", { ascending: false }).limit(3),
    supabase.from("social_inbox")
      .select("author_name, body, platform, received_at")
      .eq("category", "lead").order("received_at", { ascending: false }).limit(4),
    supabase.from("social_campaigns")
      .select("name, platform, status, spend, conversions, roas")
      .eq("status", "active").order("roas", { ascending: false }).limit(3),
  ]);

  type EngRow = { likes?: number | null; comments?: number | null; shares?: number | null };
  const eng = (r: EngRow) => (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0);
  const engSum = (rows: EngRow[] | null) => (rows ?? []).reduce((a, r) => a + eng(r), 0);

  const totals = {
    impressions: sumField(curr, "impressions"),
    engagements: engSum(curr),
    followers: sumField(curr, "followers_gained"),
    revenue: sumField(curr, "revenue"),
  };
  const prevTotals = {
    impressions: sumField(prev, "impressions"),
    engagements: engSum(prev),
    followers: sumField(prev, "followers_gained"),
    revenue: sumField(prev, "revenue"),
  };

  const platformMap: Record<string, number> = {};
  (curr ?? []).forEach((r) => {
    const k = platformLabel(r.platform);
    platformMap[k] = (platformMap[k] ?? 0) + (r.impressions || 0);
  });
  const maxImpr = Math.max(...Object.values(platformMap), 1);
  const platforms = Object.entries(platformMap)
    .map(([name, impressions]) => ({ name, impressions, pct: Math.round((impressions / maxImpr) * 100) }))
    .sort((a, b) => b.impressions - a.impressions);

  const connectedCount = (accounts ?? []).filter((a) => a.status === "connected").length;
  const totalFollowers = sumField(accounts, "followers");

  const metrics = [
    { label: "Impressions", value: fmtNum(totals.impressions), icon: Eye, color: "var(--sai-indigo)", ...pctChange(totals.impressions, prevTotals.impressions) },
    { label: "Engagements", value: fmtNum(totals.engagements), icon: Heart, color: "var(--sai-violet)", ...pctChange(totals.engagements, prevTotals.engagements) },
    { label: "New followers", value: `+${fmtNum(totals.followers)}`, icon: Users, color: "#34d399", ...pctChange(totals.followers, prevTotals.followers) },
    { label: "Revenue", value: fmtNaira(totals.revenue), icon: DollarSign, color: "var(--sai-gold)", ...pctChange(totals.revenue, prevTotals.revenue) },
  ];

  const hasData = (curr?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-data text-[11px] uppercase tracking-[0.22em] text-[var(--sai-indigo)]">Last 30 days</span>
          <h1 className="font-display mt-1.5 text-[26px] font-semibold tracking-[-0.02em] text-[var(--fg)] sm:text-[30px]">Overview</h1>
          <p className="mt-1.5 text-sm text-[var(--fg-3)]">
            {connectedCount > 0 ? `${connectedCount} account(s) · ${fmtNum(totalFollowers)} followers` : "Across your connected accounts."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <SyncButton />
          <Link href="/dashboard/create" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 26px -10px rgba(99,102,241,0.8)" }}>
            <Zap className="h-4 w-4" /> New post
          </Link>
        </div>
      </div>

      {connectedCount === 0 && (
        <div className="glass-panel mb-5 flex flex-col items-center rounded-2xl p-10 text-center">
          <Plug className="mb-3 h-9 w-9 text-[var(--fg-4)]" />
          <p className="font-medium text-[var(--fg-2)]">No accounts connected yet</p>
          <p className="mt-1 text-[13px] text-[var(--fg-4)]">Connect a social account to see real stats here.</p>
          <Link href="/dashboard/integrations" className="mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Connect an account</Link>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${m.color} 16%, transparent)` }}>
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
              </span>
              {m.change !== "—" && (
                <span className="font-data flex items-center gap-0.5 text-[12px]" style={{ color: m.positive ? "#34d399" : "var(--sai-red)" }}>
                  {m.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{m.change}
                </span>
              )}
            </div>
            <div className="font-display mt-3 text-2xl font-semibold text-[var(--fg)]">{m.value || "—"}</div>
            <div className="mt-0.5 text-[13px] text-[var(--fg-3)]">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
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

        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Top performing posts</h3>
            <Link href="/dashboard/analytics" className="text-[12.5px] text-[var(--sai-indigo)] hover:text-indigo-300">View all</Link>
          </div>
          {!hasData || !topPosts?.length ? (
            <p className="text-sm text-[var(--fg-4)]">No post data yet — connect an account and hit Sync.</p>
          ) : (
            <div className="space-y-2">
              {topPosts.map((post, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-[var(--hover)]">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg font-data text-[11px] font-bold text-[var(--fg-2)]" style={{ background: "var(--panel-fill-2)" }}>{platformLabel(post.platform).slice(0, 2)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[var(--fg)]">{post.content ?? "No content"}</p>
                    <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--fg-4)]">
                      <span>{platformLabel(post.platform)}</span><span>·</span>
                      <span>{fmtNum(post.impressions)} views</span><span>·</span>
                      <span>{fmtNum((post.likes ?? 0) + (post.comments ?? 0))} eng.</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-sm font-semibold" style={{ color: "#34d399" }}>{post.revenue > 0 ? fmtNaira(post.revenue) : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Leads from inbox */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><InboxIcon className="h-5 w-5 text-[var(--sai-indigo)]" /><h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Latest leads</h3></div>
            <Link href="/dashboard/inbox" className="text-[12.5px] text-[var(--sai-indigo)] hover:text-indigo-300">Inbox</Link>
          </div>
          {!leads?.length ? (
            <p className="text-sm text-[var(--fg-4)]">No leads flagged yet.</p>
          ) : (
            <div className="space-y-2.5">
              {leads.map((l, i) => (
                <div key={i} className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[var(--fg)]">{l.author_name ?? "Unknown"}</span>
                    <span className="text-[11px] text-[var(--fg-4)]">{l.platform}</span>
                  </div>
                  <p className="truncate text-[12.5px] text-[var(--fg-3)]">{l.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active campaigns */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-[var(--sai-gold)]" /><h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Active campaigns</h3></div>
            <Link href="/dashboard/analytics" className="text-[12.5px] text-[var(--sai-indigo)] hover:text-indigo-300">Analytics</Link>
          </div>
          {!campaigns?.length ? (
            <p className="text-sm text-[var(--fg-4)]">No active campaigns.</p>
          ) : (
            <div className="space-y-2.5">
              {campaigns.map((c, i) => (
                <div key={i} className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[var(--fg)]">{c.name}</span>
                    <span className="font-data text-[12px]" style={{ color: "#34d399" }}>{Number(c.roas).toFixed(1)}× ROAS</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--fg-4)]">
                    <span>{c.platform}</span><span>·</span><span>{fmtNaira(c.spend)} spent</span><span>·</span><span>{fmtNum(c.conversions)} conv.</span>
                    <Link href="/dashboard/analytics" className="ml-auto inline-flex items-center gap-1 text-[var(--sai-indigo)]"><ArrowUpRight className="h-3 w-3" /> Improve</Link>
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
