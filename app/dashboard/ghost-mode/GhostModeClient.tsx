"use client";

import { useState } from "react";
import { Ghost, Bot, AlertCircle, Settings2, Pause, Play, Zap } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/ui";
import type { AgentActionRow } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/dashboard/helpers";

const ACTION_META = {
  auto_reply: { icon: Bot, color: "#34d399", label: "Auto-replied" },
  flag_lead: { icon: AlertCircle, color: "var(--sai-gold)", label: "Lead detected" },
  escalate_complaint: { icon: AlertCircle, color: "var(--sai-red)", label: "Escalated" },
  ignore: { icon: Bot, color: "rgba(255,255,255,0.5)", label: "Ignored" },
} as const;

const DEFAULT_RULES = [
  { label: "Auto-reply to compliments & emojis", enabled: true },
  { label: "Flag comments asking about prices", enabled: true },
  { label: "Escalate customer complaints", enabled: true },
  { label: "Auto-reply to 'great post' variants", enabled: true },
  { label: "Detect & flag potential leads", enabled: true },
  { label: "Ignore spam comments", enabled: false },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors" style={{ background: on ? "linear-gradient(135deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.12)" }}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }} />
    </button>
  );
}

interface Props {
  initialActions: AgentActionRow[];
  statsToday: { autoReplies: number; leads: number; hoursSaved: number };
  initiallyActive: boolean;
}

export function GhostModeClient({ initialActions, statsToday, initiallyActive }: Props) {
  const [agentActive, setAgentActive] = useState(initiallyActive);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const toggleRule = (i: number) => setRules((prev) => prev.map((r, j) => (i === j ? { ...r, enabled: !r.enabled } : r)));

  const stats = [
    { label: "Auto-replies (today)", value: String(statsToday.autoReplies), color: "#34d399" },
    { label: "Leads flagged (today)", value: String(statsToday.leads), color: "var(--sai-gold)" },
    { label: "Hours saved this week", value: `${statsToday.hoursSaved}h`, color: "var(--sai-indigo)" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Automation"
        title="Ghost Mode™"
        sub="Your autonomous engagement agent. It handles the noise — you handle the signal."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="font-data inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider" style={{ color: agentActive ? "#34d399" : "rgba(255,255,255,0.5)", background: agentActive ? "color-mix(in srgb,#34d399 13%,transparent)" : "rgba(255,255,255,0.05)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: agentActive ? "#34d399" : "rgba(255,255,255,0.4)" }} /> {agentActive ? "Active" : "Paused"}
            </span>
            <button onClick={() => setAgentActive(!agentActive)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]" style={agentActive ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" } : { background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              {agentActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {agentActive ? "Pause agent" : "Activate agent"}
            </button>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <GlassCard key={i} className="p-5 text-center">
            <div className="font-display text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="mt-1 text-[12px] text-white/45">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* log */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="font-display mb-4 text-[15px] font-semibold text-white">Live agent log</h3>
          {initialActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ghost className="mb-3 h-10 w-10 text-white/15" />
              <p className="font-medium text-white/70">No agent actions yet</p>
              <p className="mt-1 text-[12px] text-white/40">Connect your accounts and activate the agent to see activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialActions.map((action) => {
                const meta = ACTION_META[action.action as keyof typeof ACTION_META] ?? ACTION_META.ignore;
                const Icon = meta.icon;
                return (
                  <div key={action.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${meta.color} 16%, transparent)` }}>
                        <Icon className="h-4 w-4" style={{ color: meta.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[12px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                          {action.platform && <span className="text-[12px] text-white/40">{action.platform}</span>}
                          <span className="ml-auto text-[11px] text-white/35">{timeAgo(action.created_at)}</span>
                        </div>
                        <p className="mb-1 text-[13px] italic text-white/50">&ldquo;{action.comment}&rdquo;</p>
                        {action.reply && <p className="rounded-md border border-[#34d399]/15 bg-[#34d399]/[0.06] px-3 py-1.5 text-[13px] text-white/80">→ {action.reply}</p>}
                        {!action.reply && action.action !== "ignore" && (
                          <div className="mt-2 flex gap-2">
                            <button className="rounded-full px-3 py-1 text-[12px] font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Reply now</button>
                            <button className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[12px] text-white/70 hover:bg-white/[0.08]">Dismiss</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* rules */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2"><Settings2 className="h-5 w-5 text-white/50" /><h3 className="font-display text-[15px] font-semibold text-white">Agent rules</h3></div>
            <div className="space-y-3.5">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <p className="flex-1 text-[13px] text-white/60">{rule.label}</p>
                  <Toggle on={rule.enabled} onChange={() => toggleRule(i)} />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4" style={{ borderColor: "rgba(245,196,81,0.2)", background: "rgba(245,196,81,0.05)" }}>
            <div className="mb-2 flex items-center gap-2"><Zap className="h-4 w-4 text-[var(--sai-gold)]" /><p className="text-sm font-medium text-white">Pro tip</p></div>
            <p className="text-[12px] text-white/55">Set an Auto-Plug trigger: when a post hits 50+ engagements, the agent drops your product link in a reply.</p>
            <button className="mt-3 w-full rounded-full border border-white/12 bg-white/[0.04] py-1.5 text-[12px] text-white/80 hover:bg-white/[0.08]">Configure Auto-Plug</button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
