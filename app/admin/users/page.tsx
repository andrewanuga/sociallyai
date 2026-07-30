"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Ban, CircleCheck, Loader2 } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { PLAN_ORDER, type PlanId } from "@/lib/billing/plans";

type Row = {
  id: string; full_name: string | null; username: string | null; persona: string | null;
  plan: PlanId; subscription_status: string | null; suspended: boolean; is_admin: boolean; created_at: string;
};

export default function AdminUsers() {
  const { success, error: toastError } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("profiles")
        .select("id, full_name, username, persona, plan, subscription_status, suspended, is_admin, created_at")
        .order("created_at", { ascending: false }).limit(500);
      if (data) setRows(data as Row[]);
    } catch { /* offline */ }
    setLoaded(true);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.full_name, r.username, r.persona, r.plan].some((v) => (v ?? "").toLowerCase().includes(s)));
  }, [rows, q]);

  const toggleSuspend = async (r: Row) => {
    setBusy(r.id);
    const next = !r.suspended;
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, suspended: next } : x)));
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({
        suspended: next, suspended_at: next ? new Date().toISOString() : null,
      }).eq("id", r.id);
      if (error) throw error;
      // Log the admin action (best-effort; RLS lets admins insert? events are service-role only, so ignore failure).
      await supabase.from("security_events").insert({ type: "account_suspended", user_id: r.id, severity: "warning", detail: `${next ? "Suspended" : "Reinstated"} ${r.full_name ?? r.id}` }).then(() => {}, () => {});
      success(next ? "Account suspended" : "Account reinstated");
    } catch (e) {
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, suspended: r.suspended } : x)));
      toastError("Couldn't update account", e instanceof Error ? e.message : undefined);
    } finally { setBusy(null); }
  };

  const changePlan = async (r: Row, plan: PlanId) => {
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, plan } : x)));
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ plan }).eq("id", r.id);
      if (error) throw error;
      success("Plan updated");
    } catch (e) {
      toastError("Couldn't change plan", e instanceof Error ? e.message : undefined); load();
    }
  };

  const initials = (r: Row) => (r.full_name || r.username || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Management" title="Users" sub={`${rows.length} registered · suspend, reinstate, or change any plan.`}
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="h-9 w-56 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] pl-9 pr-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none" />
          </div>
        }
      />

      <GlassCard className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_auto] gap-3 border-b border-[var(--stroke)] px-4 py-3 font-data text-[10.5px] uppercase tracking-wider text-[var(--fg-4)]">
          <span>User</span><span>Persona</span><span>Plan</span><span>Joined</span><span className="text-right">Actions</span>
        </div>
        {!loaded ? (
          <p className="px-4 py-8 text-sm text-[var(--fg-4)]">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-sm text-[var(--fg-4)]">No users found.</p>
        ) : (
          <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
            {filtered.map((r) => (
              <div key={r.id} className="grid grid-cols-[1.6fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-[var(--stroke)] px-4 py-3 last:border-0" style={r.suspended ? { opacity: 0.6 } : undefined}>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>{initials(r)}</span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[13.5px] font-medium text-[var(--fg)]">{r.full_name || "—"} {r.is_admin && <Pill tone="red">admin</Pill>} {r.suspended && <Pill tone="muted">suspended</Pill>}</p>
                    <p className="truncate text-[12px] text-[var(--fg-4)]">{r.username ? `@${r.username}` : r.id.slice(0, 8)}</p>
                  </div>
                </div>
                <span className="text-[12.5px] capitalize text-[var(--fg-3)]">{r.persona ?? "—"}</span>
                <select value={r.plan} onChange={(e) => changePlan(r, e.target.value as PlanId)} className="w-fit rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2 py-1 text-[12.5px] capitalize text-[var(--fg)] focus:outline-none">
                  {PLAN_ORDER.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <span className="text-[12px] text-[var(--fg-4)]">{new Date(r.created_at).toLocaleDateString()}</span>
                <div className="flex justify-end">
                  <button onClick={() => toggleSuspend(r)} disabled={busy === r.id || r.is_admin}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors disabled:opacity-40"
                    style={r.suspended ? { borderColor: "rgba(52,211,153,0.4)", color: "#34d399" } : { borderColor: "color-mix(in srgb, var(--sai-red) 40%, transparent)", color: "var(--sai-red)" }}>
                    {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : r.suspended ? <CircleCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    {r.suspended ? "Reinstate" : "Suspend"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
