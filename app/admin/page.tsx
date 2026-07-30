"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, ShieldAlert, Ban, DollarSign, Activity, CreditCard } from "lucide-react";
import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { fmtNaira, fmtNum, timeAgo } from "@/lib/dashboard/helpers";
import { PLAN_ORDER, PLANS, type PlanId } from "@/lib/billing/plans";

type Evt = { id: string; type: string; ip: string | null; email: string | null; severity: string; created_at: string; detail: string | null };

const sevColor: Record<string, string> = { critical: "var(--sai-red)", warning: "var(--sai-gold)", info: "var(--sai-indigo)" };

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, new7: 0, suspended: 0, blocked: 0, events24: 0, revenue: 0 });
  const [plans, setPlans] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<Evt[]>([]);
  const [signups, setSignups] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
        const since24 = new Date(Date.now() - 864e5).toISOString();
        const [
          { count: users }, { count: new7 }, { count: suspended }, { count: blocked }, { count: events24 },
          { data: profiles }, { data: pays }, { data: evs },
        ] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since7),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("suspended", true),
          supabase.from("blocked_ips").select("ip", { count: "exact", head: true }),
          supabase.from("security_events").select("id", { count: "exact", head: true }).gte("created_at", since24),
          supabase.from("profiles").select("plan, created_at"),
          supabase.from("payments").select("amount, status"),
          supabase.from("security_events").select("id, type, ip, email, severity, created_at, detail").order("created_at", { ascending: false }).limit(12),
        ]);

        const planMap: Record<string, number> = {};
        (profiles ?? []).forEach((p) => { planMap[p.plan ?? "free"] = (planMap[p.plan ?? "free"] ?? 0) + 1; });
        const revenue = (pays ?? []).filter((p) => p.status === "success").reduce((a, p) => a + Number(p.amount), 0);

        // signups per day, last 14 days
        const buckets = new Array(14).fill(0);
        (profiles ?? []).forEach((p) => {
          const d = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 864e5);
          if (d >= 0 && d < 14) buckets[13 - d]++;
        });

        setStats({ users: users ?? 0, new7: new7 ?? 0, suspended: suspended ?? 0, blocked: blocked ?? 0, events24: events24 ?? 0, revenue });
        setPlans(planMap); setEvents((evs ?? []) as Evt[]); setSignups(buckets);
      } catch { /* offline / not admin */ }
    })();
  }, []);

  const maxSignup = Math.max(...signups, 1);
  const maxPlan = Math.max(...Object.values(plans), 1);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Security operations" title="SOC Overview" sub="Live view of users, revenue, and security across Socially AI." />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Total users" value={fmtNum(stats.users)} icon={Users} tone="indigo" />
        <StatTile label="New (7d)" value={`+${fmtNum(stats.new7)}`} icon={UserPlus} tone="violet" />
        <StatTile label="Revenue" value={fmtNaira(stats.revenue)} icon={DollarSign} tone="green" />
        <StatTile label="Events (24h)" value={fmtNum(stats.events24)} icon={Activity} tone="gold" />
        <StatTile label="Blocked IPs" value={fmtNum(stats.blocked)} icon={Ban} tone="red" />
        <StatTile label="Suspended" value={fmtNum(stats.suspended)} icon={ShieldAlert} tone="red" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* signups chart */}
        <GlassCard className="p-5">
          <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Signups · last 14 days</p>
          <div className="mt-5 flex h-40 items-end gap-1.5">
            {signups.map((v, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / maxSignup) * 100}%`, minHeight: 3, background: "linear-gradient(180deg,#6366f1,#a855f7)" }} title={`${v}`} />
            ))}
          </div>
        </GlassCard>

        {/* plan distribution */}
        <GlassCard className="p-5">
          <div className="mb-1 flex items-center gap-2"><CreditCard className="h-4 w-4 text-[var(--sai-indigo)]" /><p className="font-display text-[15px] font-semibold text-[var(--fg)]">Plans</p></div>
          <div className="mt-4 space-y-3.5">
            {PLAN_ORDER.map((id) => {
              const n = plans[id] ?? 0;
              return (
                <div key={id}>
                  <div className="mb-1.5 flex items-center justify-between text-[12.5px]"><span className="text-[var(--fg-2)] capitalize">{PLANS[id as PlanId].name}</span><span className="font-data text-[var(--fg-3)]">{n}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-fill-2)]"><div className="h-full rounded-full" style={{ width: `${(n / maxPlan) * 100}%`, background: "linear-gradient(90deg,#6366f1,#a855f7)" }} /></div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* recent security events */}
      <GlassCard className="mt-5 p-5">
        <div className="mb-4 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-[var(--sai-red)]" /><p className="font-display text-[15px] font-semibold text-[var(--fg)]">Recent security events</p></div>
        {events.length === 0 ? (
          <p className="text-sm text-[var(--fg-4)]">No events recorded yet.</p>
        ) : (
          <div className="space-y-1.5">
            {events.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: sevColor[e.severity] ?? "var(--fg-4)" }} />
                <Pill tone={e.severity === "critical" ? "red" : e.severity === "warning" ? "gold" : "indigo"}>{e.type}</Pill>
                <span className="truncate text-[12.5px] text-[var(--fg-3)]">{e.detail ?? e.email ?? e.ip ?? "—"}</span>
                <span className="ml-auto flex-shrink-0 font-data text-[11px] text-[var(--fg-4)]">{e.ip}</span>
                <span className="flex-shrink-0 text-[11px] text-[var(--fg-4)]">{timeAgo(e.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
