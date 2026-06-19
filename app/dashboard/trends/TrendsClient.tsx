"use client";

import { useState } from "react";
import { TrendingUp, Sparkles, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Trend } from "@/lib/supabase/types";

interface TrendsClientProps {
  trends: Trend[];
  userNiche: string | null;
}

export function TrendsClient({ trends: initialTrends, userNiche }: TrendsClientProps) {
  const [trends, setTrends]           = useState(initialTrends);
  const [selectedTrend, setSelected]  = useState<number | null>(null);
  const [refreshing, setRefreshing]   = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/ai/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: userNiche ?? "General" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.trends)) setTrends(data.trends);
      }
    } catch { /* silent */ } finally {
      setRefreshing(false);
    }
  };

  const momentumColor = (m: string | null) => {
    if (!m) return "text-muted-foreground";
    if (["Accelerating", "Rising fast"].includes(m)) return "text-green-400";
    if (["Steady", "Building"].includes(m))           return "text-amber-400";
    return "text-muted-foreground";
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-foreground" />
            Trend Predictor
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            AI-matched trending topics with personalised draft suggestions based on your history
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh trends
        </Button>
      </div>

      {trends.length === 0 ? (
        <div className="p-12 rounded-xl border border-dashed border-border bg-card/50 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium mb-1">No trends cached yet</p>
          <p className="text-sm text-muted-foreground/70 mb-4">
            Click &ldquo;Refresh trends&rdquo; to fetch AI-matched topics for your niche.
          </p>
          <Button variant="gradient" className="gap-2" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Fetch trends now
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trends list */}
          <div className="space-y-3">
            {trends.map((trend, i) => (
              <div
                key={trend.id}
                onClick={() => setSelected(i === selectedTrend ? null : i)}
                className={cn(
                  "p-5 rounded-xl border cursor-pointer transition-all duration-200",
                  selectedTrend === i
                    ? "border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/5"
                    : "border-border bg-card hover:border-red-500/20 hover:shadow-md"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-sm mb-1">{trend.topic}</h3>
                    {trend.category && (
                      <Badge variant="secondary" className="text-xs">{trend.category}</Badge>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold gradient-text">{trend.score ?? "—"}</div>
                    <div className="text-xs text-green-400 font-medium">{trend.growth}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium ${momentumColor(trend.momentum)}`}>
                    ● {trend.momentum ?? "Unknown"}
                  </span>
                  <Progress value={trend.score ?? 0} className="w-24 h-1.5" />
                </div>

                {trend.why && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                    💡 {trend.why}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Draft panel */}
          <div className="sticky top-6">
            {selectedTrend !== null && trends[selectedTrend] ? (
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold">AI-Generated Draft</h3>
                  <Badge variant="red" className="ml-auto text-xs">
                    Score: {trends[selectedTrend].score}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border mb-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {trends[selectedTrend].draft ?? "No draft available. Regenerate to create one."}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="gradient" className="flex-1 gap-2 text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    Send to Composer
                  </Button>
                  <Button variant="outline" className="gap-2 text-sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center text-center min-h-[300px]">
                <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium mb-1">Select a trend</p>
                <p className="text-sm text-muted-foreground/70">
                  Click any trend card to see an AI-generated draft ready to edit and post
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
