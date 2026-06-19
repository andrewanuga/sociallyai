"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Sparkles, Calendar, Send, Image, Hash, AtSign,
  RotateCw, Zap, TrendingUp, TrendingDown, Loader2,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "x",         name: "X (Twitter)", maxChars: 280  },
  { id: "linkedin",  name: "LinkedIn",    maxChars: 3000 },
  { id: "instagram", name: "Instagram",   maxChars: 2200 },
  { id: "tiktok",    name: "TikTok",      maxChars: 2200 },
];

const FRAMEWORKS = [
  { id: "aida",  label: "AIDA",          desc: "Attention → Interest → Desire → Action" },
  { id: "pas",   label: "PAS",           desc: "Problem → Agitate → Solve"              },
  { id: "hook",  label: "Curiosity Hook",desc: "Open loop to drive engagement"          },
  { id: "story", label: "Story Arc",     desc: "Narrative-driven content"               },
];

const TONES = ["Professional", "Casual", "Naija Vibe", "Witty", "Inspirational", "Educational"];

interface ScoreData {
  score: number;
  prediction: "high" | "medium" | "low";
  bestTime: string;
  reasoning: string;
  improvements: string[];
}

export default function ComposePage() {
  const [content,           setContent]           = useState("");
  const [topic,             setTopic]             = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["x"]);
  const [framework,         setFramework]         = useState("aida");
  const [tone,              setTone]              = useState("Professional");
  const [generating,        setGenerating]        = useState(false);
  const [scoring,           setScoring]           = useState(false);
  const [scheduling,        setScheduling]        = useState(false);
  const [scoreData,         setScoreData]         = useState<ScoreData | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Auto-score (debounced)
  useEffect(() => {
    if (!content || content.length < 30) { setScoreData(null); return; }
    const timer = setTimeout(async () => {
      setScoring(true);
      try {
        const res = await fetch("/api/ai/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, platform: selectedPlatforms[0] || "x" }),
        });
        if (res.ok) setScoreData(await res.json());
      } catch { /* silent */ } finally { setScoring(false); }
    }, 1200);
    return () => clearTimeout(timer);
  }, [content, selectedPlatforms]);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) { showToast("error", "Enter a topic before generating"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, platform: selectedPlatforms[0] || "x", framework, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent(data.content);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Generation failed");
    } finally { setGenerating(false); }
  }, [topic, selectedPlatforms, framework, tone]);

  const handleSchedule = async () => {
    if (!content.trim()) { showToast("error", "Write or generate content first"); return; }
    setScheduling(true);
    try {
      const res = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selectedPlatforms, score: scoreData?.score }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("success", `Scheduled to ${selectedPlatforms.length} platform(s) successfully`);
      setContent(""); setTopic(""); setScoreData(null);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Scheduling failed");
    } finally { setScheduling(false); }
  };

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const activeLimit = PLATFORMS.find((p) => selectedPlatforms.includes(p.id))?.maxChars || 280;
  const charCount   = content.length;
  const charPct     = Math.min((charCount / activeLimit) * 100, 100);

  // Semantic: high=green, medium=amber, low=red
  const scoreColor =
    scoreData?.prediction === "high"   ? "text-green-400"
    : scoreData?.prediction === "medium" ? "text-amber-400"
    : "text-red-500";

  const scoreBorder =
    scoreData?.prediction === "high"   ? "border-green-500/30 bg-green-500/5"
    : scoreData?.prediction === "medium" ? "border-amber-400/20 bg-amber-400/5"
    : "border-red-600/20 bg-red-600/5";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in slide-in-from-top-2 duration-300",
            toast.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Compose</h1>
        <p className="text-muted-foreground text-sm">
          Write or generate AI-powered content and schedule it across platforms
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main composer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Platform selector */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm font-medium mb-3">Post to</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    selectedPlatforms.includes(p.id)
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Topic input */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Topic / prompt for AI generation
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 lessons I learned bootstrapping a SaaS in Lagos"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground border-b border-border pb-2 focus:border-red-500 transition-colors"
            />
          </div>

          {/* Text editor */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your post content will appear here after generation, or type directly..."
              className="min-h-[280px] resize-none border-0 focus-visible:ring-0 p-0 text-base leading-relaxed"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
              <div className="flex items-center gap-1">
                {[Image, Hash, AtSign].map((Icon, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {scoring && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                <div className="relative w-7 h-7">
                  <svg viewBox="0 0 36 36" className="w-7 h-7 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                      strokeDasharray={`${charPct} 100`}
                      className={cn("transition-all", charPct > 95 ? "text-red-600" : "text-red-500")}
                      stroke="currentColor"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium">
                    {activeLimit - charCount > 0 ? activeLimit - charCount : "!"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="gradient" className="flex-1 gap-2 min-w-[160px]" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate with AI"}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleSchedule} disabled={scheduling || !content}>
              {scheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              {scheduling ? "Scheduling..." : "Schedule"}
            </Button>
            <Button variant="default" className="gap-2" disabled={!content || scheduling} onClick={handleSchedule}>
              <Send className="w-4 h-4" />
              Post now
            </Button>
          </div>
        </div>

        {/* Sidebar controls */}
        <div className="space-y-4">
          {/* Live Socially Score */}
          {content.length > 30 && (
            <div className={cn("p-4 rounded-xl border transition-all", scoreData ? scoreBorder : "border-border")}>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400" />
                Socially Score™
                {scoring && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />}
              </p>

              {scoreData ? (
                <>
                  <div className="flex items-end gap-2 mb-1">
                    <span className={`text-4xl font-bold ${scoreColor}`}>{scoreData.score}</span>
                    <span className="text-sm text-muted-foreground pb-1">/ 100</span>
                    {scoreData.prediction === "high"
                      ? <TrendingUp className="w-4 h-4 text-green-400 pb-0.5" />
                      : scoreData.prediction === "medium"
                      ? <TrendingUp className="w-4 h-4 text-amber-400 pb-0.5" />
                      : <TrendingDown className="w-4 h-4 text-red-500 pb-0.5" />}
                  </div>
                  <p className={`text-xs font-medium ${scoreColor} mb-1`}>
                    {scoreData.prediction === "high" ? "High engagement predicted"
                      : scoreData.prediction === "medium" ? "Average engagement expected"
                      : "Low engagement risk"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">Best: {scoreData.bestTime}</p>
                  <p className="text-xs text-muted-foreground italic mb-2">{scoreData.reasoning}</p>
                  {scoreData.improvements?.length > 0 && (
                    <div className="space-y-1 mt-2 border-t border-border pt-2">
                      <p className="text-xs font-medium text-muted-foreground">Improvements:</p>
                      {scoreData.improvements.slice(0, 2).map((imp, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {imp}</p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Analysing your content…</div>
              )}
            </div>
          )}

          {/* Framework selector */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm font-medium mb-3">Writing Framework</p>
            <div className="space-y-2">
              {FRAMEWORKS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFramework(f.id)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg border text-sm transition-all",
                    framework === f.id
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="font-medium">{f.label}</span>
                  <span className="text-xs block opacity-70 mt-0.5">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone selector */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm font-medium mb-3">Brand Tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs border transition-all",
                    tone === t
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2 text-sm" onClick={handleGenerate} disabled={generating || !topic.trim()}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
            Regenerate variation
          </Button>
        </div>
      </div>
    </div>
  );
}
