"use client";

import { useEffect, useState } from "react";
import {
  Camera, Play, AtSign, Building2, Users, Hash, Ghost,
  MessagesSquare, Send, MessageCircle, Check, Plug, Loader2, X, KeyRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { PLATFORM_LIST, CAPABILITY_LABEL, type PlatformId, type PlatformDef } from "@/lib/social/platforms";
import type { SocialAccount } from "@/lib/social/types";

const ICONS: Record<PlatformId, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  instagram: Camera, youtube: Play, x: AtSign, linkedin: Building2, facebook: Users,
  threads: Hash, snapchat: Ghost, reddit: MessagesSquare, telegram: Send, whatsapp: MessageCircle,
};

export default function IntegrationsPage() {
  const { success, error: toastError } = useToast();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [tokenFor, setTokenFor] = useState<PlatformDef | null>(null);
  const [tokenVal, setTokenVal] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("social_accounts").select("*").order("connected_at", { ascending: false });
      if (data) setAccounts(data as SocialAccount[]);
    } catch { /* offline */ }
  };
  useEffect(() => { load(); }, []);

  // Toast after the OAuth redirect returns.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const connected = sp.get("connected");
    const err = sp.get("error");
    if (connected) success(`${connected} connected`);
    else if (err) {
      const map: Record<string, string> = {
        not_configured: "This platform isn't configured yet — add its API keys.",
        denied: "Connection was cancelled.",
        bad_state: "Session expired. Please try again.",
        token_failed: "The platform rejected the token exchange.",
        store_failed: "Couldn't save the account.",
        unsupported: "That platform isn't available.",
        exchange_error: "Couldn't reach the platform.",
      };
      toastError("Couldn't connect", map[err] ?? err);
    }
    if (connected || err) window.history.replaceState({}, "", "/dashboard/integrations");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accountsFor = (id: PlatformId) => accounts.filter((a) => a.platform === id);

  const connectOAuth = (p: PlatformDef) => {
    // Real OAuth redirect; the route returns a helpful error if creds are missing.
    window.location.href = `/api/social/connect/${p.id}`;
  };

  const connectToken = async () => {
    if (!tokenFor || !tokenVal.trim()) return;
    setBusy(tokenFor.id);
    try {
      const res = await fetch(`/api/social/connect/${tokenFor.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenVal.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      success(`${tokenFor.name} connected`);
      setTokenFor(null); setTokenVal("");
      load();
    } catch (e) {
      toastError("Couldn't connect", e instanceof Error ? e.message : undefined);
    } finally { setBusy(null); }
  };

  const disconnect = async (acc: SocialAccount) => {
    setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
    if (userId) {
      const supabase = createClient();
      const { error } = await supabase.from("social_accounts").delete().eq("id", acc.id);
      if (error) { toastError("Couldn't disconnect", error.message); load(); }
      else success("Disconnected");
    }
  };

  const groups: Array<{ title: string; items: PlatformDef[] }> = [
    { title: "Publishing", items: PLATFORM_LIST.filter((p) => p.category === "Publishing") },
    { title: "Messaging & bots", items: PLATFORM_LIST.filter((p) => p.category === "Messaging") },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Connect"
        title="Integrations"
        sub="Connect your social accounts. Each one unlocks publishing, inbox, analytics, campaigns, or messaging."
        actions={<Pill tone="indigo">{accounts.length} connected</Pill>}
      />

      {groups.map((g) => (
        <div key={g.title} className="mb-8">
          <p className="font-data mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--fg-4)]">{g.title}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((p) => {
              const Icon = ICONS[p.id];
              const connected = accountsFor(p.id);
              return (
                <GlassCard key={p.id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${p.color} 16%, transparent)` }}>
                      <Icon className="h-5 w-5" style={{ color: p.color }} />
                    </span>
                    {connected.length > 0 && <Pill tone="green"><Check className="h-3 w-3" /> {connected.length}</Pill>}
                  </div>

                  <h3 className="font-display mt-4 text-[15px] font-semibold text-[var(--fg)]">{p.name}</h3>

                  {/* capabilities */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.capabilities.map((c) => (
                      <span key={c} className="rounded-md px-1.5 py-0.5 text-[10px]" style={{ background: "var(--panel-fill-2)", color: "var(--fg-3)" }}>
                        {CAPABILITY_LABEL[c]}
                      </span>
                    ))}
                  </div>

                  {p.note && <p className="mt-2.5 flex-1 text-[12px] leading-relaxed text-[var(--fg-4)]">{p.note}</p>}
                  {!p.note && <div className="flex-1" />}

                  {/* connected accounts */}
                  {connected.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {connected.map((a) => (
                        <div key={a.id} className="flex items-center justify-between rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 py-1.5">
                          <span className="truncate text-[12px] text-[var(--fg-2)]">{a.handle || a.display_name || a.external_id}</span>
                          <button onClick={() => disconnect(a)} className="text-[var(--fg-4)] hover:text-[var(--sai-red)]"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => (p.connectType === "oauth" ? connectOAuth(p) : setTokenFor(p))}
                    disabled={busy === p.id}
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                  >
                    {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : p.connectType === "oauth" ? <Plug className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                    {connected.length > 0 ? "Add another" : "Connect"}
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </div>
      ))}

      {/* token connect modal (Telegram / WhatsApp) */}
      {tokenFor && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setTokenFor(null)}>
          <div className="glass-panel w-full max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()} style={{ background: "var(--app-surface)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[16px] font-semibold text-[var(--fg)]">Connect {tokenFor.name}</h3>
              <button onClick={() => setTokenFor(null)} className="text-[var(--fg-4)] hover:text-[var(--fg)]"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-3 text-[13px] text-[var(--fg-3)]">{tokenFor.tokenSetup?.label}</p>
            <input
              value={tokenVal}
              onChange={(e) => setTokenVal(e.target.value)}
              placeholder="Paste token…"
              className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50"
            />
            <a href={tokenFor.tokenSetup?.docs} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[12px] text-[var(--sai-indigo)] hover:underline">Where do I get this?</a>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setTokenFor(null)} className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2 text-[13px] text-[var(--fg-2)]">Cancel</button>
              <button onClick={connectToken} disabled={!tokenVal.trim() || busy === tokenFor.id} className="rounded-full px-5 py-2 text-[13px] font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                {busy === tokenFor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
