"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Sparkles, Calendar, Send, ImageIcon, Hash, AtSign,
  RotateCw, Zap, TrendingUp, TrendingDown, Loader2,
} from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";

const PLATFORMS = [
  { id: "x", name: "X (Twitter)", maxChars: 280 },
  { id: "linkedin", name: "LinkedIn", maxChars: 3000 },
  { id: "instagram", name: "Instagram", maxChars: 2200 },
  { id: "tiktok", name: "TikTok", maxChars: 2200 },
];

const FRAMEWORKS = [
  { id: "aida", label: "AIDA", desc: "Attention → Interest → Desire → Action" },
  { id: "pas", label: "PAS", desc: "Problem → Agitate → Solve" },
  { id: "hook", label: "Curiosity Hook", desc: "Open loop to drive engagement" },
  { id: "story", label: "Story Arc", desc: "Narrative-driven content" },
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
  const { error: toastError, success: toastSuccess } = useToast();
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["x"]);
  const [framework, setFramework] = useState("aida");
  const [tone, setTone] = useState("Professional");
  const [generating, setGenerating] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);

  useEffect(() => {
    if (!content || content.length < 30) { setScoreData(null); return; }
    const timer = setTimeout(async () => {
      setScoring(true);
      try {
        const res = await fetch("/api/ai/score", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, platform: selectedPlatforms[0] || "x" }),
        });
        if (res.ok) setScoreData(await res.json());
      } catch { /* silent */ } finally { setScoring(false); }
    }, 1200);
    return () => clearTimeout(timer);
  }, [content, selectedPlatforms]);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) { toastError("Add a topic first", "Tell the agent what to write about."); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, platform: selectedPlatforms[0] || "x", framework, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent(data.content);
    } catch (err: unknown) {
      toastError("Generation failed", err instanceof Error ? err.message : undefined);
    } finally { setGenerating(false); }
  }, [topic, selectedPlatforms, framework, tone, toastError]);

  const handleSchedule = async () => {
    if (!content.trim()) { toastError("Nothing to schedule", "Write or generate content first."); return; }
    setScheduling(true);
    try {
      const res = await fetch("/api/posts/schedule", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selectedPlatforms, score: scoreData?.score }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toastSuccess("Scheduled", `Queued to ${selectedPlatforms.length} platform(s).`);
      setContent(""); setTopic(""); setScoreData(null);
    } catch (err: unknown) {
      toastError("Scheduling failed", err instanceof Error ? err.message : undefined);
    } finally { setScheduling(false); }
  };

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const activeLimit = PLATFORMS.find((p) => selectedPlatforms.includes(p.id))?.maxChars || 280;
  const charCount = content.length;
  const charPct = Math.min((charCount / activeLimit) * 100, 100);

  const scoreColor = scoreData?.prediction === "high" ? "#34d399" : scoreData?.prediction === "medium" ? "var(--sai-gold)" : "var(--sai-red)";
  const chipStyle = (active: boolean) =>
    active
      ? { borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.12)", color: "#fff" }
      : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Workspace" title="Compose" sub="Write or generate content, score it live, and schedule across platforms." />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* main */}
        <div className="space-y-4 lg:col-span-2">
          <GlassCard className="p-4">
            <p className="mb-3 text-[13px] font-medium text-white/70">Post to</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => togglePlatform(p.id)} className="rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all" style={chipStyle(selectedPlatforms.includes(p.id))}>
                  {p.name}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <label className="mb-2 block font-data text-[11px] uppercase tracking-[0.16em] text-white/50">Topic / prompt</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 lessons I learned bootstrapping a SaaS in Lagos"
              className="w-full border-b border-white/10 bg-transparent pb-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--sai-indigo)]"
            />
          </GlassCard>

          <GlassCard className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your post will appear here after generation, or type directly…"
              className="min-h-[280px] w-full resize-none bg-transparent text-[15px] leading-relaxed text-white outline-none placeholder:text-white/35"
            />
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <div className="flex items-center gap-1">
                {[ImageIcon, Hash, AtSign].map((Icon, i) => (
                  <button key={i} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"><Icon className="h-4 w-4" /></button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {scoring && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
                <div className="relative h-7 w-7">
                  <svg viewBox="0 0 36 36" className="h-7 w-7 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" strokeDasharray={`${charPct} 100`} stroke={charPct > 95 ? "var(--sai-red)" : "var(--sai-indigo)"} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-white/70">{activeLimit - charCount > 0 ? activeLimit - charCount : "!"}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleGenerate} disabled={generating} className="flex min-w-[160px] flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating…" : "Generate with AI"}
            </button>
            <button onClick={handleSchedule} disabled={scheduling || !content} className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white hover:bg-white/[0.08] disabled:opacity-50">
              {scheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />} Schedule
            </button>
            <button onClick={handleSchedule} disabled={!content || scheduling} className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white hover:bg-white/[0.08] disabled:opacity-50">
              <Send className="h-4 w-4" /> Post now
            </button>
          </div>
        </div>

        {/* sidebar */}
        <div className="space-y-4">
          {content.length > 30 && (
            <GlassCard className="p-4" style={scoreData ? { borderColor: `color-mix(in srgb, ${scoreColor} 35%, transparent)` } : undefined}>
              <p className="flex items-center gap-2 text-[13px] font-medium text-white">
                <Zap className="h-4 w-4 text-[var(--sai-indigo)]" /> Socially Score™
                {scoring && <Loader2 className="ml-auto h-3 w-3 animate-spin text-white/40" />}
              </p>
              {scoreData ? (
                <>
                  <div className="mb-1 mt-2 flex items-end gap-2">
                    <span className="font-display text-4xl font-bold" style={{ color: scoreColor }}>{scoreData.score}</span>
                    <span className="pb-1 text-sm text-white/40">/ 100</span>
                    {scoreData.prediction === "low" ? <TrendingDown className="pb-0.5 h-4 w-4" style={{ color: scoreColor }} /> : <TrendingUp className="pb-0.5 h-4 w-4" style={{ color: scoreColor }} />}
                  </div>
                  <p className="mb-1 text-[12px] font-medium" style={{ color: scoreColor }}>
                    {scoreData.prediction === "high" ? "High engagement predicted" : scoreData.prediction === "medium" ? "Average engagement expected" : "Low engagement risk"}
                  </p>
                  <p className="mb-2 text-[12px] text-white/45">Best: {scoreData.bestTime}</p>
                  <p className="mb-2 text-[12px] italic text-white/45">{scoreData.reasoning}</p>
                  {scoreData.improvements?.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-white/[0.06] pt-2">
                      <p className="text-[12px] font-medium text-white/55">Improvements</p>
                      {scoreData.improvements.slice(0, 2).map((imp, i) => <p key={i} className="text-[12px] text-white/45">• {imp}</p>)}
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-2 text-[13px] text-white/45">Analysing your content…</p>
              )}
            </GlassCard>
          )}

          <GlassCard className="p-4">
            <p className="mb-3 text-[13px] font-medium text-white/70">Writing framework</p>
            <div className="space-y-2">
              {FRAMEWORKS.map((f) => (
                <button key={f.id} onClick={() => setFramework(f.id)} className="w-full rounded-lg border p-2.5 text-left text-sm transition-all" style={chipStyle(framework === f.id)}>
                  <span className="font-medium">{f.label}</span>
                  <span className="mt-0.5 block text-[11.5px] opacity-70">{f.desc}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="mb-3 text-[13px] font-medium text-white/70">Brand tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button key={t} onClick={() => setTone(t)} className="rounded-full border px-2.5 py-1 text-[12px] transition-all" style={chipStyle(tone === t)}>{t}</button>
              ))}
            </div>
          </GlassCard>

          <button onClick={handleGenerate} disabled={generating || !topic.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] py-2.5 text-sm font-medium text-white hover:bg-white/[0.08] disabled:opacity-50">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />} Regenerate variation
          </button>
        </div>
      </div>
    </div>
  );
}
