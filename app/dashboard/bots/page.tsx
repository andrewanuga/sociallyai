"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ghost, MessageCircleReply, Repeat2, DollarSign, Filter, MessageSquare,
  CalendarClock, FileText, Zap, Activity, Plug, Plus, Trash2, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill, StatTile } from "@/components/dashboard/ui";
import type { SocialBot, SocialAccount } from "@/lib/social/types";

type Kind = SocialBot["kind"];
const CATALOG: { kind: Kind; name: string; desc: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; messaging?: boolean }[] = [
  { kind: "ghost", name: "Ghost Mode", desc: "Replies to noise in your voice, escalates real leads.", icon: Ghost, color: "var(--sai-violet)" },
  { kind: "engagement", name: "Engagement", desc: "Comments on niche accounts to grow reach.", icon: MessageCircleReply, color: "var(--sai-indigo)" },
  { kind: "repurpose", name: "Repurpose", desc: "Turns one post into threads, captions, reels.", icon: Repeat2, color: "#34d399" },
  { kind: "monetize", name: "Auto-Plug", desc: "Drops a conversion comment at your threshold.", icon: DollarSign, color: "var(--sai-gold)" },
  { kind: "triage", name: "Inbox Triage", desc: "Sorts inbox into leads, complaints, fluff.", icon: Filter, color: "var(--sai-red)" },
  { kind: "messaging", name: "Auto-Reply", desc: "Replies to DMs/groups when you're away (Telegram/WhatsApp).", icon: MessageSquare, color: "#25D366", messaging: true },
  { kind: "scheduler", name: "Scheduled Messaging", desc: "Sends messages on a schedule.", icon: CalendarClock, color: "#229ED9", messaging: true },
  { kind: "summarizer", name: "Group Summarizer", desc: "Summarizes keynotes in flagged groups.", icon: FileText, color: "var(--sai-indigo)", messaging: true },
];

export default function BotsPage() {
  const { success, error: toastError } = useToast();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [bots, setBots] = useState<SocialBot[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [deployKind, setDeployKind] = useState<Kind | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const [{ data: acc }, { data: b }] = await Promise.all([
        supabase.from("social_accounts").select("*").eq("status", "connected"),
        supabase.from("social_bots").select("*").order("created_at", { ascending: false }),
      ]);
      if (acc) setAccounts(acc as SocialAccount[]);
      if (b) setBots(b as SocialBot[]);
    } catch { /* offline */ }
  };
  useEffect(() => { load(); }, []);

  const messagingAccounts = useMemo(() => accounts.filter((a) => a.platform === "telegram" || a.platform === "whatsapp"), [accounts]);
  const eligible = (k: Kind) => (["messaging", "scheduler", "summarizer"].includes(k) ? messagingAccounts : accounts);

  const deploy = async (kind: Kind, accountId: string) => {
    if (!userId) return;
    setBusy(true);
    const acc = accounts.find((a) => a.id === accountId);
    const supabase = createClient();
    const { data, error } = await supabase.from("social_bots").insert({
      user_id: userId, account_id: accountId, platform: acc?.platform ?? null,
      name: CATALOG.find((c) => c.kind === kind)?.name ?? kind, kind, status: "active", autonomy: "assist",
    }).select().single();
    setBusy(false); setDeployKind(null);
    if (error) toastError("Couldn't deploy bot", error.message);
    else { setBots((prev) => [data as SocialBot, ...prev]); success("Bot deployed"); }
  };

  const setStatus = async (b: SocialBot, status: "active" | "paused") => {
    setBots((prev) => prev.map((x) => (x.id === b.id ? { ...x, status } : x)));
    const supabase = createClient();
    await supabase.from("social_bots").update({ status }).eq("id", b.id);
  };
  const setAutonomy = async (b: SocialBot, autonomy: "assist" | "auto") => {
    setBots((prev) => prev.map((x) => (x.id === b.id ? { ...x, autonomy } : x)));
    const supabase = createClient();
    await supabase.from("social_bots").update({ autonomy }).eq("id", b.id);
  };
  const remove = async (b: SocialBot) => {
    setBots((prev) => prev.filter((x) => x.id !== b.id));
    const supabase = createClient();
    await supabase.from("social_bots").delete().eq("id", b.id);
  };

  const acctLabel = (id: string | null) => { const a = accounts.find((x) => x.id === id); return a ? `${a.platform}/${a.handle || a.display_name || "account"}` : "—"; };
  const activeCount = bots.filter((b) => b.status === "active").length;
  const totalActions = bots.reduce((a, b) => a + b.actions_count, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Automation" title="Bots" sub="Deploy agents to connected accounts. A bot needs an account — connection is enforced." />

      {accounts.length === 0 && (
        <div className="glass-panel mb-5 flex flex-col items-center rounded-2xl p-10 text-center">
          <Plug className="mb-3 h-9 w-9 text-[var(--fg-4)]" />
          <p className="font-medium text-[var(--fg-2)]">No connected accounts</p>
          <p className="mt-1 text-[13px] text-[var(--fg-4)]">Bots run on connected accounts. Connect one first.</p>
          <Link href="/dashboard/integrations" className="mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Connect an account</Link>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Active bots" value={String(activeCount)} icon={Zap} tone="indigo" />
        <StatTile label="Total bots" value={String(bots.length)} icon={Activity} tone="violet" />
        <StatTile label="Actions" value={String(totalActions)} icon={Activity} tone="green" />
        <StatTile label="Accounts" value={String(accounts.length)} icon={Plug} tone="gold" />
      </div>

      {/* Active bots */}
      {bots.length > 0 && (
        <div className="mb-8">
          <p className="font-data mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--fg-4)]">Deployed</p>
          <div className="grid gap-4 lg:grid-cols-2">
            {bots.map((b) => {
              const def = CATALOG.find((c) => c.kind === b.kind);
              const Icon = def?.icon ?? Ghost;
              return (
                <GlassCard key={b.id} className="p-5" style={b.status === "active" ? { borderColor: "rgba(99,102,241,0.35)" } : undefined}>
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${def?.color ?? "var(--sai-indigo)"} 16%, transparent)` }}>
                      <Icon className="h-6 w-6" style={{ color: def?.color ?? "var(--sai-indigo)" }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">{b.name}</h3>
                        {b.status === "active" ? <Pill tone="green">Active</Pill> : <Pill tone="muted">Paused</Pill>}
                      </div>
                      <p className="mt-0.5 text-[12px] text-[var(--fg-4)]">{acctLabel(b.account_id)} · {b.actions_count} actions</p>
                      <div className="mt-3 inline-flex rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] p-0.5 text-[12px]">
                        {(["assist", "auto"] as const).map((m) => (
                          <button key={m} onClick={() => setAutonomy(b, m)} className="rounded-full px-3 py-1 transition-colors" style={b.autonomy === m ? { background: "rgba(99,102,241,0.2)", color: "var(--fg)" } : { color: "var(--fg-3)" }}>
                            {m === "assist" ? "Human-in-loop" : "Full auto"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--stroke)] pt-4">
                    <button onClick={() => remove(b)} className="flex items-center gap-1.5 text-[12px] text-[var(--fg-4)] hover:text-[var(--sai-red)]"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                    <button onClick={() => setStatus(b, b.status === "active" ? "paused" : "active")} className="rounded-full px-4 py-1.5 text-[12.5px] font-semibold text-white" style={b.status === "active" ? { background: "var(--panel-fill-2)", border: "1px solid var(--stroke)", color: "var(--fg)" } : { background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                      {b.status === "active" ? "Pause" : "Activate"}
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Catalog */}
      <p className="font-data mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--fg-4)]">Deploy a bot</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {CATALOG.map((c) => {
          const canDeploy = eligible(c.kind).length > 0;
          return (
            <GlassCard key={c.kind} className="p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${c.color} 16%, transparent)` }}>
                  <c.icon className="h-6 w-6" style={{ color: c.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">{c.name}</h3>{c.messaging && <Pill tone="green">Telegram / WhatsApp</Pill>}</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--fg-3)]">{c.desc}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-[var(--stroke)] pt-4">
                {deployKind === c.kind ? (
                  <div className="flex flex-wrap gap-2">
                    {eligible(c.kind).map((a) => (
                      <button key={a.id} disabled={busy} onClick={() => deploy(c.kind, a.id)} className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[12px] text-[var(--fg-2)] hover:bg-[var(--hover)] disabled:opacity-50">
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `${a.platform}/${a.handle || "account"}`}
                      </button>
                    ))}
                    <button onClick={() => setDeployKind(null)} className="rounded-full px-3 py-1.5 text-[12px] text-[var(--fg-4)]">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeployKind(c.kind)}
                    disabled={!canDeploy}
                    title={canDeploy ? "" : c.messaging ? "Connect Telegram or WhatsApp first" : "Connect an account first"}
                    className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-semibold text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                  >
                    <Plus className="h-3.5 w-3.5" /> {canDeploy ? "Deploy to account" : "Needs a connected account"}
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
