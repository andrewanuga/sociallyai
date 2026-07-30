"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, Plus, X, ShieldAlert, Loader2 } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/dashboard/helpers";

type Blocked = { ip: string; reason: string | null; auto: boolean; created_at: string; expires_at: string | null };
type Evt = { id: string; type: string; ip: string | null; email: string | null; severity: string; path: string | null; detail: string | null; created_at: string };

const FILTERS = ["all", "critical", "warning", "info"] as const;
const sevTone = (s: string) => (s === "critical" ? "red" : s === "warning" ? "gold" : "indigo") as "red" | "gold" | "indigo";

export default function AdminSecurity() {
  const { success, error: toastError } = useToast();
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [events, setEvents] = useState<Evt[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [ipInput, setIpInput] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const supabase = createClient();
      const [{ data: b }, { data: e }] = await Promise.all([
        supabase.from("blocked_ips").select("ip, reason, auto, created_at, expires_at").order("created_at", { ascending: false }),
        supabase.from("security_events").select("id, type, ip, email, severity, path, detail, created_at").order("created_at", { ascending: false }).limit(80),
      ]);
      if (b) setBlocked(b as Blocked[]);
      if (e) setEvents(e as Evt[]);
    } catch { /* offline */ }
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => (filter === "all" ? events : events.filter((e) => e.severity === filter)), [events, filter]);

  const blockIp = async () => {
    const ip = ipInput.trim();
    if (!ip) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("blocked_ips").upsert({ ip, reason: "Manually blocked by admin", auto: false, blocked_by: user?.id ?? null }, { onConflict: "ip" });
      if (error) throw error;
      setBlocked((prev) => [{ ip, reason: "Manually blocked by admin", auto: false, created_at: new Date().toISOString(), expires_at: null }, ...prev.filter((b) => b.ip !== ip)]);
      setIpInput(""); success("IP blocked");
    } catch (e) { toastError("Couldn't block IP", e instanceof Error ? e.message : undefined); }
    finally { setBusy(false); }
  };

  const unblock = async (ip: string) => {
    setBlocked((prev) => prev.filter((b) => b.ip !== ip));
    try { await createClient().from("blocked_ips").delete().eq("ip", ip); success("IP unblocked"); }
    catch { load(); }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Security operations" title="Security" sub="Block IPs and review the live security event feed." />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        {/* Blocked IPs */}
        <GlassCard className="h-fit p-5">
          <div className="mb-3 flex items-center gap-2"><Ban className="h-4 w-4 text-[var(--sai-red)]" /><p className="font-display text-[15px] font-semibold text-[var(--fg)]">Blocked IPs</p><Pill tone="red">{blocked.length}</Pill></div>
          <div className="flex gap-2">
            <input value={ipInput} onChange={(e) => setIpInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && blockIp()} placeholder="203.0.113.5" className="h-10 flex-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none" />
            <button onClick={blockIp} disabled={!ipInput.trim() || busy} className="flex h-10 items-center gap-1 rounded-xl px-3.5 text-[13px] font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Block</button>
          </div>
          <div className="mt-4 space-y-1.5">
            {blocked.length === 0 ? (
              <p className="text-[13px] text-[var(--fg-4)]">No IPs blocked.</p>
            ) : blocked.map((b) => (
              <div key={b.ip} className="flex items-center gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2">
                <span className="font-data text-[12.5px] text-[var(--fg)]">{b.ip}</span>
                {b.auto ? <Pill tone="gold">auto</Pill> : <Pill tone="muted">manual</Pill>}
                <span className="ml-auto text-[11px] text-[var(--fg-4)]">{timeAgo(b.created_at)}</span>
                <button onClick={() => unblock(b.ip)} className="text-[var(--fg-4)] hover:text-[var(--fg)]" title="Unblock"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Events feed */}
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-[var(--sai-indigo)]" /><p className="font-display text-[15px] font-semibold text-[var(--fg)]">Event feed</p></div>
            <div className="inline-flex rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] p-0.5 text-[11.5px]">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className="rounded-full px-2.5 py-1 capitalize transition-colors" style={filter === f ? { background: "rgba(99,102,241,0.2)", color: "var(--fg)" } : { color: "var(--fg-3)" }}>{f}</button>
              ))}
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="text-[13px] text-[var(--fg-4)]">No events.</p>
          ) : (
            <div className="max-h-[calc(100vh-280px)] space-y-1.5 overflow-y-auto pr-1">
              {shown.map((e) => (
                <div key={e.id} className="flex items-start gap-2.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: e.severity === "critical" ? "var(--sai-red)" : e.severity === "warning" ? "var(--sai-gold)" : "var(--sai-indigo)" }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><Pill tone={sevTone(e.severity)}>{e.type}</Pill><span className="font-data text-[11px] text-[var(--fg-4)]">{e.ip ?? ""}</span><span className="ml-auto text-[11px] text-[var(--fg-4)]">{timeAgo(e.created_at)}</span></div>
                    <p className="mt-1 truncate text-[12.5px] text-[var(--fg-3)]">{e.detail ?? e.email ?? e.path ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
