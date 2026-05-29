import {
  TrendingUp, TrendingDown, Eye, Heart, Users,
  MousePointerClick, DollarSign, ArrowUpRight,
  Zap, Ghost, Bot, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const TOP_METRICS = [
  { label: "Total Impressions", value: "284,920", change: "+18.2%", positive: true,  icon: Eye,              color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Engagements",       value: "42,851",  change: "+24.7%", positive: true,  icon: Heart,            color: "text-red-400", bg: "bg-red-500/10" },
  { label: "New Followers",     value: "+1,284",  change: "+9.4%",  positive: true,  icon: Users,            color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Link Clicks",       value: "8,420",   change: "-3.1%",  positive: false, icon: MousePointerClick, color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Est. Revenue",      value: "₦847,000",change: "+31.5%", positive: true,  icon: DollarSign,       color: "text-red-400", bg: "bg-red-500/10" },
];

const PLATFORM_DATA = [
  { name: "LinkedIn",   impressions: 112000, pct: 72 },
  { name: "X (Twitter)",impressions: 89000,  pct: 58 },
  { name: "Instagram",  impressions: 63000,  pct: 41 },
  { name: "TikTok",     impressions: 20920,  pct: 18 },
];

const TOP_POSTS = [
  { content: "5 mistakes founders make with social media in 2026 (Thread) 🧵", platform: "X",        score: 92, impressions: "48.2K", engagement: "8.4%", revenue: "₦184,000" },
  { content: "Why we ditched ChatGPT and self-hosted our AI — cost breakdown",  platform: "LinkedIn", score: 87, impressions: "31.6K", engagement: "6.9%", revenue: "₦142,000" },
  { content: "Day in the life of a Lagos digital creator 🎥",                   platform: "Instagram",score: 71, impressions: "22.1K", engagement: "5.2%", revenue: "₦67,000"  },
];

const GHOST_LOG = [
  { type: "auto-reply", comment: '"Great post! This is so helpful 🔥"',                          action: "Auto-replied",        time: "2 min ago",  icon: Bot,          color: "text-red-400",              bg: "bg-red-500/10" },
  { type: "lead",       comment: '"How much does your service cost? DM me"',                     action: "Lead flagged",        time: "14 min ago", icon: AlertCircle,  color: "text-red-400",              bg: "bg-red-500/10" },
  { type: "auto-reply", comment: '"Amazing work as always 👏"',                                  action: "Auto-replied",        time: "28 min ago", icon: Bot,          color: "text-red-400",              bg: "bg-red-500/10" },
  { type: "escalated",  comment: '"My payment failed twice and support isn\'t responding"',       action: "Flagged for attention",time: "1 hr ago",  icon: AlertCircle,  color: "text-red-500",              bg: "bg-red-600/10" },
];

const TREND_SUGGESTIONS = [
  { topic: "AI Regulation in Africa",           score: 94, niche: "Tech / Startups",     growth: "+342%" },
  { topic: "Naira Stabilization Impact on SaaS",score: 87, niche: "Fintech / Business",  growth: "+218%" },
  { topic: "Creator Economy Nigeria 2026",       score: 81, niche: "Creators / Marketing",growth: "+156%" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Last 30 days across all connected accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="red" className="gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Ghost Mode Active
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
        {TOP_METRICS.map((m, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border bg-card hover:border-red-500/20 hover:shadow-md hover:shadow-red-500/5 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <span
                className={`text-xs font-medium flex items-center gap-0.5 ${m.positive ? "text-red-400" : "text-muted-foreground"}`}
              >
                {m.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-0.5">{m.value}</div>
            <div className="text-xs text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Platform breakdown */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4">Platform Breakdown</h3>
          <div className="space-y-4">
            {PLATFORM_DATA.map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-muted-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.impressions.toLocaleString()} impr.
                  </span>
                </div>
                <Progress value={p.pct} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Top posts */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Performing Posts</h3>
            <Link href="/dashboard/analytics" className="text-xs text-red-400 hover:text-red-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {TOP_POSTS.map((post, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold gradient-text">{post.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{post.platform}</span>
                    <span>•</span>
                    <span>{post.impressions} views</span>
                    <span>•</span>
                    <span>{post.engagement} eng.</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-red-400 flex-shrink-0">
                  {post.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ghost Mode log */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ghost className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold">Ghost Mode Agent Log</h3>
            </div>
            <Link href="/dashboard/ghost-mode" className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {GHOST_LOG.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className={`w-7 h-7 rounded-md ${entry.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <entry.icon className={`w-3.5 h-3.5 ${entry.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{entry.comment}</p>
                  <p className={`text-xs font-medium mt-0.5 ${entry.color}`}>{entry.action}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{entry.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend predictor */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold">Trend Predictor</h3>
            </div>
            <Link href="/dashboard/trends" className="text-xs text-red-400 hover:text-red-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {TREND_SUGGESTIONS.map((trend, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-border bg-muted/20 hover:border-red-500/20 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                      {trend.topic}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{trend.niche}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold gradient-text">{trend.score}</span>
                    <span className="text-xs text-red-400 font-medium">{trend.growth}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-7 gap-1.5 group-hover:border-red-500/30 group-hover:text-red-400 transition-colors"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  Draft post from this trend
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
