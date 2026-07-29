"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ghost, MessageCircleReply, Repeat2, DollarSign, Filter,
  Zap, Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill, StatTile } from "@/components/dashboard/ui";
import type { BotKind } from "@/lib/supabase/types";

type BotDef = {
  kind: BotKind; name: string; desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string;
};

const CATALOG: BotDef[] = [
  { kind: "ghost", name: "Ghost Mode", desc: "Replies to surface-level comments in your voice, escalates real leads.", icon: Ghost, color: "var(--sai-violet)" },
  { kind: "engagement", name: "Engagement Bot", desc: "Comments on niche accounts to grow reach — on your terms.", icon: MessageCircleReply, color: "var(--sai-indigo)" },
  { kind: "repurpose", name: "Repurpose Bot", desc: "Turns one post into threads, captions, and reel scripts.", icon: Repeat2, color: "#34d399" },
  { kind: "monetize", name: "Auto-Plug", desc: "Drops a conversion comment when a post hits its threshold.", icon: DollarSign, color: "var(--sai-gold)" },
  { kind: "triage", name: "Inbox Triage", desc: "Sorts your inbox into leads, complaints, and fluff.", icon: Filter, color: "var(--sai-red)" },
];

type State = { status: "active" | "paused"; autonomy: "assist" | "auto"; actions: number };

export default function BotsPage() {
  const { success, error: toastError } = useToast();
  const [state, setState] = useState<Record<string, State>>(
    Object.fromEntries(CATALOG.map((b) => [b.kind, { status: "paused", autonomy: "assist", actions: 0 }]))
  );
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data } = await supabase.from("bots").select("kind, status, autonomy, actions_count");
        if (data?.length) {
          setState((s) => {
            const next = { ...s };
            data.forEach((r) => { next[r.kind] = { status: r.status, autonomy: r.autonomy, actions: r.actions_count }; });
            return next;
          });
        }
      } catch { /* offline */ }
    })();
  }, []);

  const persist = async (b: BotDef, patch: Partial<State>) => {
    if (!userId) return;
    const cur = { ...state[b.kind], ...patch };
    const supabase = createClient();
    const { error } = await supabase.from("bots").upsert(
      { user_id: userId, name: b.name, kind: b.kind, status: cur.status, autonomy: cur.autonomy },
      { onConflict: "user_id,kind" }
    );
    if (error) toastError("Couldn't update bot", error.message);
  };

  const setStatus = (b: BotDef, status: "active" | "paused") => {
    setState((s) => ({ ...s, [b.kind]: { ...s[b.kind], status } }));
    persist(b, { status });
    success(status === "active" ? `${b.name} deployed` : `${b.name} paused`);
  };
  const setAutonomy = (b: BotDef, autonomy: "assist" | "auto") => {
    setState((s) => ({ ...s, [b.kind]: { ...s[b.kind], autonomy } }));
    persist(b, { autonomy });
  };

  const activeCount = Object.values(state).filter((s) => s.status === "active").length;
  const totalActions = Object.values(state).reduce((a, s) => a + s.actions, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Automation"
        title="Bots"
        sub="Deploy autonomous agents. Keep a human in the loop, or let them run on auto."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Active bots" value={String(activeCount)} icon={Zap} tone="indigo" />
        <StatTile label="Total actions" value={String(totalActions)} icon={Activity} tone="violet" />
        <StatTile label="Autonomy" value="Human-in-loop" icon={Ghost} tone="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CATALOG.map((b) => {
          const s = state[b.kind];
          const active = s.status === "active";
          return (
            <GlassCard key={b.kind} className="p-5" style={active ? { borderColor: "rgba(99,102,241,0.35)" } : undefined}>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${b.color} 16%, transparent)` }}>
                  <b.icon className="h-6 w-6" style={{ color: b.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">{b.name}</h3>
                    {active ? <Pill tone="green">Active</Pill> : <Pill tone="muted">Paused</Pill>}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--fg-3)]">{b.desc}</p>

                  {/* autonomy toggle */}
                  <div className="mt-4 inline-flex rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] p-0.5 text-[12px]">
                    {(["assist", "auto"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setAutonomy(b, mode)}
                        className="rounded-full px-3 py-1 transition-colors"
                        style={s.autonomy === mode ? { background: "rgba(99,102,241,0.2)", color: "#fff" } : { color: "var(--fg-3)" }}
                      >
                        {mode === "assist" ? "Human-in-loop" : "Full auto"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--stroke)] pt-4">
                <span className="text-[12px] text-[var(--fg-4)]">{s.actions} actions this month</span>
                <div className="flex items-center gap-2">
                  {b.kind === "ghost" && (
                    <Link href="/dashboard/ghost-mode" className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[12px] text-[var(--fg-2)] hover:bg-[var(--hover)]">
                      Configure
                    </Link>
                  )}
                  <button
                    onClick={() => setStatus(b, active ? "paused" : "active")}
                    className="rounded-full px-4 py-1.5 text-[12.5px] font-semibold text-[var(--fg)] transition-transform hover:scale-[1.03]"
                    style={active
                      ? { background: "var(--panel-fill-2)", border: "1px solid var(--stroke)" }
                      : { background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                  >
                    {active ? "Pause" : "Deploy"}
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
