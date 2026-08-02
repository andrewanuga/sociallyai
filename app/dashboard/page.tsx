import { redirect } from "next/navigation";
import {
  TrendingUp, TrendingDown, Eye, Heart, Users, DollarSign,
  ArrowUpRight, Zap, Plug, RefreshCw, MessageCircle, Send,
  Play, Globe, AtSign, Radio, Tv,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtNum, fmtNaira, pctChange, sumField, platformLabel, daysAgoISO } from "@/lib/dashboard/helpers";
import { SyncButton } from "@/components/dashboard/SyncButton";

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  youtube: Play,
  instagram: AtSign,
  facebook: Globe,
  x: AtSign,
  threads: MessageCircle,
  telegram: Send,
  tiktok: Tv,
  whatsapp: MessageCircle,
  linkedin: Globe,
  snapchat: Radio,
  reddit: Globe,
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000",
  instagram: "#E1306C",
  facebook: "#1877F2",
  x: "#ffffff",
  threads: "#ffffff",
  telegram: "#2AABEE",
  tiktok: "#69C9D0",
  whatsapp: "#25D366",
};

function PlatformIcon({ platform, className, color }: { platform: string; className?: string; color?: string }) {
  const Icon = PLATFORM_ICONS[platform] ?? Plug;
  return <Icon className={className} style={color ? { color } : undefined} />;
}

function generateInsight(postCount: number, impr: number, followers: number, platform: string) {
  if (postCount === 0 && followers === 0) return `Connect and sync to start tracking your ${platform} growth.`;
  if (postCount === 0) return `You have ${fmtNum(followers)} followers. Schedule a post via Compose to boost reach.`;
  if (impr === 0 && postCount > 0) return `${postCount} post(s) synced. Enable impressions tracking in your ${platform} developer settings.`;
  const avg = Math.round(impr / postCount);
  if (avg > 1000) return `Top performer! Your ${platform} content is reaching a wide audience. Keep the momentum.`;
  if (avg > 100) return `Solid reach. Repurposing your top posts as carousels could 2× these numbers.`;
  return `Growing steadily. Let Ghost Mode handle replies to boost algorithm ranking.`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: onboardProfile } = await supabase
    .from("profiles").select("onboarded, full_name").eq("id", user.id).single();
  if (onboardProfile && !onboardProfile.onboarded) redirect("/onboarding");

  const d30 = daysAgoISO(30);
  const d60 = daysAgoISO(60);

  const [
    { data: accounts },
    { data: curr },
    { data: prev },
    { data: topPosts },
    { data: leads },
  ] = await Promise.all([
    supabase.from("social_accounts")
      .select("id, platform, handle, display_name, avatar_url, followers, status, last_synced_at")
      .eq("user_id", user.id),
    supabase.from("social_posts")
      .select("platform, impressions, likes, comments, shares, followers_gained, revenue, account_id, video_views")
      .gte("posted_at", d30),
    supabase.from("social_posts")
      .select("impressions, likes, comments, shares, followers_gained, revenue")
      .gte("posted_at", d60).lt("posted_at", d30),
    supabase.from("social_posts")
      .select("content, platform, impressions, likes, comments, revenue, video_views, posted_at")
      .order("impressions", { ascending: false }).limit(5),
    supabase.from("social_inbox")
      .select("author_name, body, platform, received_at")
      .eq("category", "lead").order("received_at", { ascending: false }).limit(4),
  ]);

  type EngRow = { likes?: number | null; comments?: number | null; shares?: number | null; video_views?: number | null };
  const eng = (r: EngRow) => (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0);
  const engSum = (rows: EngRow[] | null) => (rows ?? []).reduce((a, r) => a + eng(r), 0);

  const totals = {
    impressions: sumField(curr, "impressions") + sumField(curr, "video_views"),
    engagements: engSum(curr),
    followers: (accounts ?? []).reduce((s, a) => s + (a.followers ?? 0), 0),
    revenue: sumField(curr, "revenue"),
  };
  const prevTotals = {
    impressions: sumField(prev, "impressions"),
    engagements: engSum(prev),
    followers: sumField(prev, "followers_gained"),
    revenue: sumField(prev, "revenue"),
  };

  const connectedAccounts = (accounts ?? []).filter((a) => a.status === "connected");
  const connectedCount = connectedAccounts.length;
  const totalFollowers = totals.followers;

  const metrics = [
    { label: "Total Reach", value: fmtNum(totals.impressions), icon: Eye, color: "var(--sai-indigo)", ...pctChange(totals.impressions, prevTotals.impressions) },
    { label: "Engagements", value: fmtNum(totals.engagements), icon: Heart, color: "var(--sai-violet)", ...pctChange(totals.engagements, prevTotals.engagements) },
    { label: "Total Followers", value: fmtNum(totalFollowers), icon: Users, color: "#34d399", ...pctChange(totalFollowers, prevTotals.followers) },
    { label: "Revenue", value: fmtNaira(totals.revenue), icon: DollarSign, color: "var(--sai-gold)", ...pctChange(totals.revenue, prevTotals.revenue) },
  ];

  const firstName = onboardProfile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-data text-[11px] uppercase tracking-[0.22em] text-[var(--sai-indigo)]">Last 30 days</span>
          <h1 className="font-display mt-1.5 text-[26px] font-semibold tracking-[-0.02em] text-[var(--fg)] sm:text-[30px]">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-1.5 text-sm text-[var(--fg-3)]">
            {connectedCount > 0
              ? `${connectedCount} account${connectedCount > 1 ? "s" : ""} connected · ${fmtNum(totalFollowers)} total followers`
              : "Connect your first social account to get started."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <SyncButton />
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 26px -10px rgba(99,102,241,0.8)" }}
          >
            <Zap className="h-4 w-4" /> New post
          </Link>
        </div>
      </div>

      {/* No accounts state */}
      {connectedCount === 0 && (
        <div className="glass-panel mb-6 flex flex-col items-center rounded-2xl p-12 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "color-mix(in srgb, var(--sai-indigo) 14%, transparent)" }}
          >
            <Plug className="h-8 w-8 text-[var(--sai-indigo)]" />
          </div>
          <p className="text-lg font-semibold text-[var(--fg)]">No accounts connected yet</p>
          <p className="mt-2 text-sm text-[var(--fg-4)]">Connect your social accounts to start seeing real analytics here.</p>
          <Link
            href="/dashboard/integrations"
            className="mt-5 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            Connect an account
          </Link>
        </div>
      )}

      {/* Metric cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in srgb, ${m.color} 16%, transparent)` }}
              >
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
              </span>
              {m.change !== "—" && (
                <span
                  className="font-data flex items-center gap-0.5 text-[12px]"
                  style={{ color: m.positive ? "#34d399" : "var(--sai-red)" }}
                >
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

      {/* Connected accounts grid */}
      {connectedCount > 0 && (
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">Connected Accounts</h2>
            <Link href="/dashboard/integrations" className="text-[12.5px] text-[var(--sai-indigo)] hover:text-indigo-300">
              Manage
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connectedAccounts.map((acc) => {
              const accPosts = (curr ?? []).filter((p) => p.account_id === acc.id);
              const postCount = accPosts.length;
              const accountImpr = sumField(accPosts, "impressions") + sumField(accPosts, "video_views");
              const accountEng = engSum(accPosts);
              const pColor = PLATFORM_COLORS[acc.platform] ?? "var(--sai-indigo)";
              const insightStr = generateInsight(postCount, accountImpr, acc.followers ?? 0, platformLabel(acc.platform));

              return (
                <Link
                  key={acc.id}
                  href={`/dashboard/accounts/${acc.id}`}
                  className="glass-panel group flex flex-col gap-0 rounded-2xl overflow-hidden transition-colors hover:border-[var(--sai-indigo)]/40"
                >
                  {/* Platform color bar */}
                  <div className="h-1 w-full" style={{ background: pColor, opacity: 0.7 }} />

                  <div className="flex flex-col gap-4 p-4">
                    {/* Account header */}
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0">
                        {acc.avatar_url ? (
                          <img src={acc.avatar_url} alt="" className="h-full w-full rounded-full object-cover ring-2 ring-[var(--panel-fill)]" />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center rounded-full text-[15px] font-bold"
                            style={{
                              background: `color-mix(in srgb, ${pColor} 20%, var(--panel-fill-2))`,
                              color: pColor,
                            }}
                          >
                            {(acc.display_name || acc.handle || "?").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div
                          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
                          style={{ background: pColor }}
                        >
                          <PlatformIcon platform={acc.platform} className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--fg)]">{acc.display_name || acc.handle}</p>
                        <p className="text-[12px] text-[var(--fg-4)]">{platformLabel(acc.platform)}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-[var(--fg-4)] opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-[var(--panel-fill-2)] p-3 text-center">
                      <div>
                        <p className="font-display text-base font-bold text-[var(--fg)]">{fmtNum(acc.followers ?? 0)}</p>
                        <p className="text-[11px] text-[var(--fg-4)]">Followers</p>
                      </div>
                      <div>
                        <p className="font-display text-base font-bold text-[var(--fg)]">{fmtNum(postCount)}</p>
                        <p className="text-[11px] text-[var(--fg-4)]">Posts (30d)</p>
                      </div>
                      <div>
                        <p className="font-display text-base font-bold text-[var(--fg)]">{fmtNum(accountImpr)}</p>
                        <p className="text-[11px] text-[var(--fg-4)]">Reach</p>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div
                      className="rounded-xl p-3"
                      style={{ background: `color-mix(in srgb, ${pColor} 8%, var(--panel-fill))`, borderLeft: `3px solid ${pColor}` }}
                    >
                      <p className="text-[11.5px] leading-relaxed text-[var(--fg-2)]">
                        <span className="font-semibold" style={{ color: pColor }}>AI Insight: </span>
                        {insightStr}
                      </p>
                    </div>

                    {/* Last synced */}
                    {acc.last_synced_at && (
                      <p className="flex items-center gap-1 text-[11px] text-[var(--fg-4)]">
                        <RefreshCw className="h-3 w-3" />
                        Synced {new Date(acc.last_synced_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Top Posts */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Recent Posts</h3>
            <Link href="/dashboard/analytics" className="text-[12.5px] text-[var(--sai-indigo)] hover:text-indigo-300">
              View all
            </Link>
          </div>
          {!topPosts?.length ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="text-sm text-[var(--fg-4)]">No posts yet.</p>
              <p className="mt-1 text-[12px] text-[var(--fg-4)]">Hit Sync or create your first post.</p>
              <div className="mt-3 flex gap-2">
                <SyncButton />
                <Link
                  href="/dashboard/create"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white"
                  style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                >
                  <Zap className="h-3 w-3" /> Create post
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {topPosts.map((post, i) => {
                const pColor = PLATFORM_COLORS[post.platform] ?? "var(--sai-indigo)";
                const reach = (post.impressions ?? 0) + (post.video_views ?? 0);
                return (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--hover)]">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `color-mix(in srgb, ${pColor} 18%, var(--panel-fill-2))` }}
                    >
                      <PlatformIcon platform={post.platform} className="h-4 w-4" color={pColor} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[var(--fg)]">{post.content ?? "No caption"}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[12px] text-[var(--fg-4)]">
                        <span>{platformLabel(post.platform)}</span>
                        {reach > 0 && <><span>·</span><span>{fmtNum(reach)} views</span></>}
                        {((post.likes ?? 0) + (post.comments ?? 0)) > 0 && (
                          <><span>·</span><span>{fmtNum((post.likes ?? 0) + (post.comments ?? 0))} eng.</span></>
                        )}
                      </div>
                    </div>
                    {post.revenue > 0 && (
                      <span className="flex-shrink-0 text-sm font-semibold" style={{ color: "#34d399" }}>
                        {fmtNaira(post.revenue)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leads / Quick actions */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Latest Leads</h3>
            <Link href="/dashboard/inbox" className="text-[12.5px] text-[var(--sai-indigo)] hover:text-indigo-300">
              Inbox
            </Link>
          </div>
          {!leads?.length ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="text-sm text-[var(--fg-4)]">No leads flagged yet.</p>
              <p className="mt-1 text-[12px] text-[var(--fg-4)]">
                Ghost Mode will automatically flag potential leads from your DMs.
              </p>
              <Link
                href="/dashboard/ghost-mode"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white"
                style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
              >
                Enable Ghost Mode
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {leads.map((l, i) => {
                const pColor = PLATFORM_COLORS[l.platform] ?? "var(--sai-indigo)";
                return (
                  <div key={i} className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[var(--fg)]">{l.author_name ?? "Unknown"}</span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: `color-mix(in srgb, ${pColor} 18%, transparent)`, color: pColor }}
                      >
                        {platformLabel(l.platform)}
                      </span>
                    </div>
                    <p className="truncate text-[12.5px] text-[var(--fg-3)]">{l.body}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick action tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { href: "/dashboard/compose", label: "Compose Post", icon: Zap, color: "#6366f1" },
          { href: "/dashboard/trends", label: "View Trends", icon: TrendingUp, color: "#a855f7" },
          { href: "/dashboard/ghost-mode", label: "Ghost Mode", icon: MessageCircle, color: "#34d399" },
          { href: "/dashboard/analytics", label: "Analytics", icon: Eye, color: "var(--sai-gold)" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="glass-panel flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all hover:scale-[1.02] hover:border-[var(--sai-indigo)]/30"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `color-mix(in srgb, ${action.color} 16%, transparent)` }}
            >
              <action.icon className="h-5 w-5" style={{ color: action.color }} />
            </div>
            <p className="text-[12.5px] font-medium text-[var(--fg-2)]">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
