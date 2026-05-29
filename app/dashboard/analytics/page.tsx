import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const PLATFORM_STATS = [
  { name: "LinkedIn",   letter: "in", impressions: "112K", engagements: "18.4K", followers: "+428", growth: "+22%", positive: true  },
  { name: "X (Twitter)",letter: "X",  impressions: "89K",  engagements: "14.2K", followers: "+312", growth: "+15%", positive: true  },
  { name: "Instagram",  letter: "IG", impressions: "63K",  engagements: "8.9K",  followers: "+204", growth: "+41%", positive: true  },
  { name: "TikTok",     letter: "TT", impressions: "20.9K",engagements: "1.3K",  followers: "+89",  growth: "-2%",  positive: false },
];

const CONTENT_PERFORMANCE = [
  { type: "Text threads",        score: 92, posts: 18, avgEng: "8.4%", bar: 92 },
  { type: "Carousel posts",      score: 78, posts: 12, avgEng: "6.9%", bar: 78 },
  { type: "Short videos",        score: 71, posts: 8,  avgEng: "5.2%", bar: 71 },
  { type: "Images with quotes",  score: 64, posts: 22, avgEng: "4.1%", bar: 64 },
  { type: "Polls",               score: 58, posts: 6,  avgEng: "3.7%", bar: 58 },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-red-400" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          30-day performance across all connected accounts
        </p>
      </div>

      {/* Platform breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {PLATFORM_STATS.map((p, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card hover:border-red-500/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground">{p.letter}</span>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${p.positive ? "text-red-400" : "text-muted-foreground"}`}>
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
                <p className="text-lg font-bold text-red-400">{p.followers}</p>
                <p className="text-xs text-muted-foreground">New followers</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ROI Pulse summary */}
      <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold">ROI Pulse — Revenue Attribution</h3>
          </div>
          <Badge variant="red">Active tracking</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Attributed Revenue",  value: "₦847,000", icon: DollarSign  },
            { label: "Total Link Clicks",   value: "8,420",    icon: ArrowUpRight },
            { label: "Conversions",         value: "284",      icon: Users        },
            { label: "Avg Conversion Rate", value: "3.4%",     icon: TrendingUp   },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-red-400">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content type performance */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Content Type Performance</h3>
        <div className="space-y-4">
          {CONTENT_PERFORMANCE.map((c, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-32 text-sm text-muted-foreground flex-shrink-0">{c.type}</div>
              <div className="flex-1">
                <Progress value={c.bar} className="h-2" />
              </div>
              <div className="flex items-center gap-6 text-sm flex-shrink-0">
                <span className="font-bold gradient-text">{c.score}</span>
                <span className="text-muted-foreground w-12 text-right">{c.posts} posts</span>
                <span className="text-red-400 w-12 text-right">{c.avgEng}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
