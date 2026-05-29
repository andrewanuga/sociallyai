"use client";

import { useState } from "react";
import { TrendingUp, Sparkles, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const TRENDS = [
  {
    topic: "AI Regulation in Africa",
    category: "Tech / Policy",
    score: 94,
    growth: "+342%",
    momentum: "Accelerating",
    why: "Your accounts see +67% engagement on AI policy content vs. avg",
    draft: "🚨 New AI governance framework just dropped in Nigeria — here's what it means for founders building AI products in Africa... [Thread]",
  },
  {
    topic: "Naira Stabilization & SaaS Pricing",
    category: "Fintech / Business",
    score: 87,
    growth: "+218%",
    momentum: "Rising fast",
    why: "High relevance to your Nigeria-focused audience",
    draft: "The Naira holding at ₦1,580/$ for 6 weeks straight has changed how we price SaaS in Africa. Here's what I've learned...",
  },
  {
    topic: "Creator Economy Nigeria 2026",
    category: "Creators / Marketing",
    score: 81,
    growth: "+156%",
    momentum: "Steady",
    why: "Directly matches your primary content niche",
    draft: "The Nigerian creator economy just crossed $1.2B. Here's the playbook nobody is talking about for monetizing your audience in 2026...",
  },
  {
    topic: "Remote Work Africa: The New Normal",
    category: "Lifestyle / Work",
    score: 74,
    growth: "+98%",
    momentum: "Building",
    why: "Strong performance on work-related threads in your history",
    draft: "I managed a fully remote team across 4 African countries for 18 months. What nobody tells you about the timezone struggles...",
  },
  {
    topic: "Bootstrapped vs Funded Startups 2026",
    category: "Startups / VC",
    score: 68,
    growth: "+74%",
    momentum: "Moderate",
    why: "Matches your founder audience profile",
    draft: "After seeing 50+ Nigerian startups up close: here's when to bootstrap and when to raise. The answer surprised me...",
  },
];

export default function TrendsPage() {
  const [selectedTrend, setSelectedTrend] = useState<number | null>(null);
  const [refreshing,    setRefreshing]    = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-400" />
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trends list */}
        <div className="space-y-3">
          {TRENDS.map((trend, i) => (
            <div
              key={i}
              onClick={() => setSelectedTrend(i === selectedTrend ? null : i)}
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
                  <Badge variant="secondary" className="text-xs">{trend.category}</Badge>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold gradient-text">{trend.score}</div>
                  <div className="text-xs text-red-400 font-medium">{trend.growth}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-red-400">● {trend.momentum}</span>
                <Progress value={trend.score} className="w-24 h-1.5" />
              </div>

              <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                💡 {trend.why}
              </p>
            </div>
          ))}
        </div>

        {/* Draft panel */}
        <div className="sticky top-6">
          {selectedTrend !== null ? (
            <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold">AI-Generated Draft</h3>
                <Badge variant="red" className="ml-auto text-xs">
                  Score: {TRENDS[selectedTrend].score}
                </Badge>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border mb-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {TRENDS[selectedTrend].draft}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="gradient" className="flex-1 gap-2 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  Send to Composer
                </Button>
                <Button variant="outline" className="gap-2 text-sm">
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
    </div>
  );
}
