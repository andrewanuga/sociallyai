"use client";

import { useEffect, useState } from "react";
import { CreditCard, Check, Zap, Crown, Rocket, Shield, ArrowUpRight, AlertCircle, Loader2, Users } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { fmtNaira } from "@/lib/dashboard/helpers";
import { PLANS, type PlanId } from "@/lib/billing/plans";

const PLAN_META: { id: PlanId; icon: typeof Zap; features: string[]; popular?: boolean }[] = [
  { id: "free", icon: Zap, features: ["1 social account", "Basic scheduling", "7 AI generations/week", "0 team seats"] },
  { id: "basic", icon: Shield, features: ["3 social accounts", "Brand Voice setup", "Trend Discovery", "100 AI generations/month", "3 team seats"] },
  { id: "pro", icon: Rocket, popular: true, features: ["7 social accounts", "1 Ghost Mode Agent", "ROI Pulse tracking", "Auto-Plug Loop", "500 AI generations/month", "5 team seats"] },
  { id: "advanced", icon: Crown, features: ["15+ social accounts", "3 Autonomous Agents", "Smart Inbox Triage", "White-label reports", "API access", "10 team seats"] },
  { id: "team", icon: Users, features: ["Unlimited team seats", "50 social accounts", "10 Autonomous Agents", "Custom API integration", "Priority support"] },
];

type Payment = { id: string; reference: string; plan: string | null; amount: number; status: string; created_at: string; paid_at: string | null };

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : (used > 0 ? 100 : 0);
  const over = limit > 0 && used >= limit;
  const bar = over ? "var(--sai-red)" : pct >= 80 ? "var(--sai-gold)" : "linear-gradient(90deg,#6366f1,#a855f7)";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className="text-[var(--fg-2)]">{label}</span>
        <span className="font-data text-[var(--fg-3)]">{used} / {limit === 0 ? "—" : limit}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-fill-2)]">
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: bar }} />
      </div>
      <p className="mt-1 text-[11.5px]" style={{ color: over ? "var(--sai-red)" : "var(--fg-4)" }}>
        {limit === 0 ? "Not on your plan — upgrade to unlock" : over ? "Limit reached — upgrade for more" : `${Math.max(0, limit - used)} remaining`}
      </p>
    </div>
  );
}

export default function BillingPage() {
  const { success, error: toastError } = useToast();
  const [plan, setPlan] = useState<PlanId>("free");
  const [status, setStatus] = useState<string>("inactive");
  const [renews, setRenews] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Payment[]>([]);
  const [usage, setUsage] = useState({ generations: 0, accounts: 0, bots: 0, collaborators: 0, resetAt: null as string | null });
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: p }, { data: pay }, { count: acctCount }, { count: botCount }, { count: collabCount }] = await Promise.all([
        supabase.from("profiles").select("plan, subscription_status, plan_renews_at, generations_used, generations_reset_at").eq("id", user.id).single(),
        supabase.from("payments").select("id, reference, plan, amount, status, created_at, paid_at").order("created_at", { ascending: false }).limit(12),
        supabase.from("social_accounts").select("id", { count: "exact", head: true }).eq("status", "connected").eq("user_id", user.id),
        supabase.from("social_bots").select("id", { count: "exact", head: true }).eq("status", "active").eq("user_id", user.id),
        supabase.from("workspace_members").select("id", { count: "exact", head: true }).eq("workspace_id", user.id),
      ]);
      if (p) {
        setPlan((p.plan as PlanId) ?? "free"); setStatus(p.subscription_status ?? "inactive"); setRenews(p.plan_renews_at ?? null);
        setUsage({ generations: p.generations_used ?? 0, accounts: acctCount ?? 0, bots: botCount ?? 0, collaborators: collabCount ?? 0, resetAt: p.generations_reset_at ?? null });
      }
      if (pay) setInvoices(pay as Payment[]);
    } catch { /* offline */ }
    setLoaded(true);
  };
  useEffect(() => { load(); }, []);

  // Toast after returning from Paystack.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const paid = sp.get("paid");
    if (paid === "1") success("Payment successful", `You're now on the ${sp.get("plan") ?? "new"} plan.`);
    else if (paid === "0") toastError("Payment not completed", "You weren't charged. Try again anytime.");
    if (paid) window.history.replaceState({}, "", "/dashboard/billing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = async (target: PlanId) => {
    if (target === plan || busy) return;
    setBusy(target);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't start checkout");
      if (data.free) { success("Switched to Free"); load(); }
      else if (data.authorization_url) window.location.href = data.authorization_url;
    } catch (e) {
      toastError("Checkout failed", e instanceof Error ? e.message : undefined);
    } finally { setBusy(null); }
  };

  const current = PLANS[plan];
  const currentIcon = PLAN_META.find((m) => m.id === plan)?.icon ?? Zap;
  const CurrentIcon = currentIcon;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Account" title="Billing & Plans" sub="Manage your subscription, usage, and payments — powered by Paystack." />

      {/* Current plan */}
      <GlassCard className="mb-5 p-6" style={{ borderColor: "rgba(99,102,241,0.35)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <CurrentIcon className="h-5 w-5 text-[var(--sai-indigo)]" />
              <span className="font-display text-lg font-semibold text-[var(--fg)]">{current.name} Plan</span>
              <Pill tone={status === "active" ? "green" : "muted"}>{status === "active" ? "Active" : status}</Pill>
            </div>
            <p className="text-[13px] text-[var(--fg-3)]">
              {plan === "free" ? "Free forever." : renews ? `Renews ${new Date(renews).toLocaleDateString()} · ${fmtNaira(current.price)}/month` : `${fmtNaira(current.price)}/month`}
            </p>
          </div>
          {plan !== "free" && (
            <button onClick={() => choose("free")} disabled={busy !== null} className="rounded-full px-4 py-2 text-[13px] text-[var(--fg-3)] transition-colors hover:text-[var(--sai-red)] disabled:opacity-50">
              Cancel / downgrade
            </button>
          )}
        </div>
      </GlassCard>

      {/* Usage this cycle */}
      <GlassCard className="mb-5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">Usage this cycle</h3>
          {usage.resetAt && <span className="text-[12px] text-[var(--fg-4)]">Resets {new Date(usage.resetAt).toLocaleDateString()}</span>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <UsageMeter label="AI generations" used={usage.generations} limit={current.generations} />
          <UsageMeter label="Connected accounts" used={usage.accounts} limit={current.accounts} />
          <UsageMeter label="Active bots" used={usage.bots} limit={current.bots} />
          <UsageMeter label="Collaborators" used={usage.collaborators} limit={current.collaborators} />
        </div>
      </GlassCard>

      {/* Plans */}
      <h3 className="mb-4 font-display text-[15px] font-semibold text-[var(--fg)]">Choose a plan</h3>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_META.map((m) => {
          const cfg = PLANS[m.id];
          const active = m.id === plan;
          return (
            <GlassCard key={m.id} className="relative flex flex-col p-5" style={active ? { borderColor: "rgba(99,102,241,0.5)", boxShadow: "0 20px 60px -30px rgba(99,102,241,0.8)" } : undefined}>
              {active && <span className="font-data absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Current</span>}
              {m.popular && !active && <span className="font-data absolute -top-2.5 left-4 rounded-full border border-[var(--sai-indigo)]/40 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--sai-indigo)]">Popular</span>}
              <div className="flex items-center gap-2"><m.icon className="h-4 w-4 text-[var(--sai-indigo)]" /><span className="text-sm font-medium text-[var(--fg)]">{cfg.name}</span></div>
              <div className="mt-3"><span className="font-display text-2xl font-semibold text-[var(--fg)]">{fmtNaira(cfg.price)}</span><span className="text-[12px] text-[var(--fg-4)]">/mo</span></div>
              <ul className="mt-4 flex-1 space-y-2">
                {m.features.map((f, i) => (<li key={i} className="flex items-start gap-1.5 text-[12.5px] text-[var(--fg-3)]"><Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--sai-violet)]" /><span>{f}</span></li>))}
              </ul>
              <button
                onClick={() => choose(m.id)}
                disabled={active || busy !== null}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[12.5px] font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                style={active ? { background: "var(--panel-fill-2)", border: "1px solid var(--stroke)", color: "var(--fg)" } : { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff" }}
              >
                {busy === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {active ? "Current plan" : m.id === "free" ? "Downgrade" : `Upgrade to ${cfg.name}`}
              </button>
            </GlassCard>
          );
        })}
      </div>

      {/* Payment method */}
      <GlassCard className="mb-5 p-6">
        <h3 className="font-display mb-2 flex items-center gap-2 text-[15px] font-semibold text-[var(--fg)]"><CreditCard className="h-4 w-4 text-[var(--fg-3)]" /> Payment method</h3>
        <div className="flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5 text-[var(--fg-4)]" /><p className="text-[13px] text-[var(--fg-3)]">Cards, bank transfer, and USSD are collected securely by Paystack at checkout — we never store card details. Flutterwave and all Nigerian bank cards are accepted.</p></div>
      </GlassCard>

      {/* Invoices */}
      <GlassCard className="p-6">
        <h3 className="font-display mb-4 text-[15px] font-semibold text-[var(--fg)]">Invoice history</h3>
        {!loaded ? (
          <p className="text-sm text-[var(--fg-4)]">Loading…</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-[var(--fg-4)]">No payments yet. Upgrade a plan to see invoices here.</p>
        ) : (
          <div>
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between border-b border-[var(--stroke)] py-3 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--fg)]">{new Date(inv.paid_at ?? inv.created_at).toLocaleDateString()}</span>
                  {inv.plan && <Pill tone="muted">{inv.plan}</Pill>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[var(--fg)]">{fmtNaira(inv.amount)}</span>
                  <Pill tone={inv.status === "success" ? "green" : inv.status === "failed" ? "red" : "muted"}>{inv.status}</Pill>
                  <a href={`https://dashboard.paystack.com/#/transactions`} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full px-2 py-1 text-[12px] text-[var(--fg-3)] hover:text-[var(--fg)]"><ArrowUpRight className="h-3 w-3" /> View</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
