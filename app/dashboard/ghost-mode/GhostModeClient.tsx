"use client";

import { useRef, useState } from "react";
import {
  Ghost, Bot, AlertCircle, Settings2, Pause, Play, Zap,
  Send, MessageCircle, X, Loader2, CheckCircle2,
} from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import type { AgentActionRow } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/dashboard/helpers";

const ACTION_META = {
  auto_reply: { icon: Bot, color: "#34d399", label: "Auto-replied" },
  flag_lead: { icon: AlertCircle, color: "var(--sai-gold)", label: "Lead detected" },
  escalate_complaint: { icon: AlertCircle, color: "var(--sai-red)", label: "Escalated" },
  ignore: { icon: Bot, color: "var(--fg-3)", label: "Ignored" },
} as const;

const DEFAULT_RULES = [
  { label: "Auto-reply to compliments & emojis", enabled: true },
  { label: "Flag comments asking about prices", enabled: true },
  { label: "Escalate customer complaints", enabled: true },
  { label: "Auto-reply to 'great post' variants", enabled: true },
  { label: "Detect & flag potential leads", enabled: true },
  { label: "Ignore spam comments", enabled: false },
];

const PLATFORMS = [
  { id: "telegram", label: "Telegram" },
  { id: "twitter", label: "Twitter / X" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "linkedin", label: "LinkedIn" },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sai-indigo)]/40"
      style={{ background: on ? "linear-gradient(135deg,#6366f1,#a855f7)" : "var(--stroke)" }}
    >
      <span
        className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

interface DMModalProps {
  action: AgentActionRow;
  onClose: () => void;
}

function DMModal({ action, onClose }: DMModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [platform, setPlatform] = useState(action.platform || "telegram");
  const [recipient, setRecipient] = useState("");
  const [msgText, setMsgText] = useState(
    `Hi! I noticed your interest and wanted to follow up personally. ${action.reply ? `I already responded: "${action.reply}"` : ""} Would love to chat more!`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!recipient.trim() || !msgText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/social/send-dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, recipient: recipient.trim(), message: msgText }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toastSuccess(`DM sent to ${recipient} on ${platform}`);
        setTimeout(onClose, 1500);
      } else {
        toastError("DM failed", data.error);
      }
    } catch (e: any) {
      toastError("Send error", e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Send Direct Message</h3>
              <p className="text-[12px] text-[var(--fg-4)]">Lead: {action.action === "flag_lead" ? "🟡 High priority" : "from Ghost Mode"}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[var(--fg-4)] hover:bg-[var(--hover)] hover:text-[var(--fg)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lead context */}
        {action.comment && (
          <div className="mb-4 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">Their comment</p>
            <p className="mt-1 text-[13px] italic text-[var(--fg-2)]">&ldquo;{action.comment}&rdquo;</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Platform selector */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--fg-3)]">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className="rounded-full px-3 py-1 text-[12px] font-medium transition-all"
                  style={
                    platform === p.id
                      ? { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white" }
                      : { background: "var(--panel-fill-2)", color: "var(--fg-3)", border: "1px solid var(--stroke)" }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--fg-3)]">
              {platform === "whatsapp" ? "Phone number (with country code)" : platform === "telegram" ? "Chat ID or @username" : "Username or ID"}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={platform === "whatsapp" ? "+1234567890" : "@username or ID"}
              className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)] focus:outline-none"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--fg-3)]">Message</label>
            <textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)] focus:outline-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || sent || !recipient.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: sent ? "#34d399" : "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            {sent ? (
              <><CheckCircle2 className="h-4 w-4" /> Sent!</>
            ) : sending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="h-4 w-4" /> Send Message</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  initialActions: AgentActionRow[];
  statsToday: { autoReplies: number; leads: number; hoursSaved: number };
  initiallyActive: boolean;
  botId?: string | null;
  savedRules?: { label: string; enabled: boolean }[] | null;
}

export function GhostModeClient({ initialActions, statsToday, initiallyActive, botId = null, savedRules = null }: Props) {
  const { success, error: toastError } = useToast();
  const [agentActive, setAgentActive] = useState(initiallyActive);
  const [rules, setRules] = useState(savedRules?.length ? savedRules : DEFAULT_RULES);
  const idRef = useRef<string | null>(botId);
  const [dmAction, setDmAction] = useState<AgentActionRow | null>(null);

  const persist = async (patch: { status?: "active" | "paused"; rules?: typeof rules }) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const nextStatus = patch.status ?? (agentActive ? "active" : "paused");
      const nextRules = patch.rules ?? rules;
      if (idRef.current) {
        await supabase.from("social_bots").update({ status: nextStatus, config: { rules: nextRules } }).eq("id", idRef.current);
      } else {
        const { data } = await supabase.from("social_bots").insert({
          user_id: user.id, name: "Ghost Mode", kind: "ghost", status: nextStatus, config: { rules: nextRules },
        }).select("id").single();
        if (data) idRef.current = data.id;
      }
    } catch { toastError("Couldn't save Ghost Mode"); }
  };

  const toggleActive = () => {
    const next = !agentActive;
    setAgentActive(next);
    persist({ status: next ? "active" : "paused" });
    success(next ? "Ghost Mode activated" : "Ghost Mode paused");
  };
  const toggleRule = (i: number) => {
    const next = rules.map((r, j) => (i === j ? { ...r, enabled: !r.enabled } : r));
    setRules(next);
    persist({ rules: next });
  };

  const stats = [
    { label: "Auto-replies (today)", value: String(statsToday.autoReplies), color: "#34d399" },
    { label: "Leads flagged (today)", value: String(statsToday.leads), color: "var(--sai-gold)" },
    { label: "Hours saved this week", value: `${statsToday.hoursSaved}h`, color: "var(--sai-indigo)" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {dmAction && <DMModal action={dmAction} onClose={() => setDmAction(null)} />}

      <PageHeader
        eyebrow="Automation"
        title="Ghost Mode™"
        sub="Your autonomous engagement agent. It handles the noise — you handle the signal."
        actions={
          <div className="flex items-center gap-2.5">
            <span
              className="font-data inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider"
              style={{
                color: agentActive ? "#34d399" : "var(--fg-3)",
                background: agentActive ? "color-mix(in srgb,#34d399 13%,transparent)" : "var(--panel-fill-2)",
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: agentActive ? "#34d399" : "var(--fg-4)" }} />
              {agentActive ? "Active" : "Paused"}
            </span>
            <button
              onClick={toggleActive}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-transform hover:scale-[1.03]"
              style={
                agentActive
                  ? { background: "var(--panel-fill-2)", border: "1px solid var(--stroke)", color: "var(--fg)" }
                  : { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white" }
              }
            >
              {agentActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {agentActive ? "Pause agent" : "Activate agent"}
            </button>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <GlassCard key={i} className="p-5 text-center">
            <div className="font-display text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="mt-1 text-[12px] text-[var(--fg-3)]">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Live agent log */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="font-display mb-4 text-[15px] font-semibold text-[var(--fg)]">Live agent log</h3>
          {initialActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ghost className="mb-3 h-10 w-10 text-[var(--fg-4)]" />
              <p className="font-medium text-[var(--fg-2)]">No agent actions yet</p>
              <p className="mt-1 text-[12px] text-[var(--fg-4)]">Connect your accounts and activate the agent to see activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialActions.map((action) => {
                const meta = ACTION_META[action.action as keyof typeof ACTION_META] ?? ACTION_META.ignore;
                const Icon = meta.icon;
                const isLead = action.action === "flag_lead";
                return (
                  <div
                    key={action.id}
                    className="rounded-xl border p-4 transition-colors"
                    style={{
                      borderColor: isLead ? "rgba(245,196,81,0.3)" : "var(--stroke)",
                      background: isLead ? "rgba(245,196,81,0.04)" : "var(--panel-fill)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${meta.color} 16%, transparent)` }}>
                        <Icon className="h-4 w-4" style={{ color: meta.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[12px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                          {action.platform && <span className="text-[12px] text-[var(--fg-4)]">{action.platform}</span>}
                          <span className="ml-auto text-[11px] text-[var(--fg-4)]">{timeAgo(action.created_at)}</span>
                        </div>
                        <p className="mb-1 text-[13px] italic text-[var(--fg-3)]">&ldquo;{action.comment}&rdquo;</p>
                        {action.reply && <p className="rounded-md border border-[#34d399]/15 bg-[#34d399]/[0.06] px-3 py-1.5 text-[13px] text-[var(--fg)]">→ {action.reply}</p>}
                        <div className="mt-2 flex gap-2">
                          {!action.reply && action.action !== "ignore" && (
                            <button className="rounded-full px-3 py-1 text-[12px] font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                              Reply now
                            </button>
                          )}
                          {/* DM this lead button */}
                          <button
                            onClick={() => setDmAction(action)}
                            className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1 text-[12px] text-[var(--fg-2)] transition-all hover:border-[var(--sai-indigo)]/50 hover:text-[var(--fg)]"
                          >
                            <Send className="h-3 w-3" />
                            {isLead ? "DM this lead" : "Send DM"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Rules panel */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[var(--fg-3)]" />
              <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Agent rules</h3>
            </div>
            <div className="space-y-3.5">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <p className="flex-1 text-[13px] text-[var(--fg-2)]">{rule.label}</p>
                  <Toggle on={rule.enabled} onChange={() => toggleRule(i)} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Send DM quick-action panel */}
          <GlassCard className="p-4" style={{ borderColor: "rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.04)" }}>
            <div className="mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[var(--sai-indigo)]" />
              <p className="text-sm font-medium text-[var(--fg)]">Quick DM</p>
            </div>
            <p className="text-[12px] text-[var(--fg-2)]">Send a message to anyone on any connected platform directly from your AI agent.</p>
            <button
              onClick={() => setDmAction({ id: "quick", action: "flag_lead", comment: "", reply: null, platform: "telegram", created_at: new Date().toISOString() } as AgentActionRow)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full py-1.5 text-[12px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
            >
              <Send className="h-3.5 w-3.5" /> Send a message
            </button>
          </GlassCard>

          <GlassCard className="p-4" style={{ borderColor: "rgba(245,196,81,0.2)", background: "rgba(245,196,81,0.05)" }}>
            <div className="mb-2 flex items-center gap-2"><Zap className="h-4 w-4 text-[var(--sai-gold)]" /><p className="text-sm font-medium text-[var(--fg)]">Pro tip</p></div>
            <p className="text-[12px] text-[var(--fg-2)]">Set an Auto-Plug trigger: when a post hits 50+ engagements, the agent drops your product link in a reply.</p>
            <button className="mt-3 w-full rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] py-1.5 text-[12px] text-[var(--fg)] hover:bg-[var(--hover)]">Configure Auto-Plug</button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
