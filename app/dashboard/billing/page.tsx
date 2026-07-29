"use client";

import { useState } from "react";
import { CreditCard, Check, Zap, Crown, Rocket, Shield, ArrowUpRight, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";

const PLANS = [
  { id: "free", name: "Free", icon: Zap, price: "₦0", period: "/mo", features: ["1 social account", "Basic scheduling", "7 AI generations/week"] },
  { id: "basic", name: "Basic", icon: Shield, price: "₦5,000", period: "/mo", features: ["3 social accounts", "Brand Voice setup", "Trend Discovery", "100 AI generations/month"] },
  { id: "pro", name: "Pro", icon: Rocket, price: "₦12,000", period: "/mo", popular: true, features: ["7 social accounts", "1 Ghost Mode Agent", "ROI Pulse tracking", "Auto-Plug Loop", "500 AI generations/month", "2 team seats"] },
  { id: "advanced", name: "Advanced", icon: Crown, price: "₦25,000", period: "/mo", features: ["15+ social accounts", "3 Autonomous Agents", "Smart Inbox Triage", "White-label reports", "API access", "1,000 AI generations/month", "5 team seats"] },
];

const INVOICES = [
  { date: "May 1, 2026", amount: "₦12,000", plan: "Pro", status: "Paid" },
  { date: "Apr 1, 2026", amount: "₦12,000", plan: "Pro", status: "Paid" },
  { date: "Mar 1, 2026", amount: "₦5,000", plan: "Basic", status: "Paid" },
  { date: "Feb 1, 2026", amount: "₦0", plan: "Free", status: "Paid" },
];

const TOPUP_PACKS = [
  { credits: 50, price: "₦1,500", tag: null },
  { credits: 200, price: "₦5,000", tag: "Best value" },
  { credits: 500, price: "₦10,000", tag: null },
];

function Meter({ label, value, total, note }: { label: string; value: string; total?: number; note: string; }) {
  const pct = typeof total === "number" ? total : Number(value);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className="text-[var(--fg-3)]">{label}</span>
        <span className="font-data text-[var(--fg)]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-fill-2)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#a855f7)" }} />
      </div>
      <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">{note}</p>
    </div>
  );
}

export default function BillingPage() {
  const [currentPlan] = useState("pro");
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const used = 312, total = 500;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Account" title="Billing & Plans" sub="Manage your subscription, usage, and payment methods." />

      {/* Current plan */}
      <GlassCard className="mb-5 p-6" style={{ borderColor: "rgba(99,102,241,0.35)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Rocket className="h-5 w-5 text-[var(--sai-indigo)]" />
              <span className="font-display text-lg font-semibold text-[var(--fg)]">Pro Plan</span>
              <Pill tone="green">Active</Pill>
            </div>
            <p className="text-[13px] text-[var(--fg-3)]">Renews June 1, 2026 · ₦12,000/month</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2 text-[13px] text-[var(--fg)] hover:bg-[var(--hover)]"><RefreshCw className="h-3.5 w-3.5" /> Change plan</button>
            <button className="rounded-full px-4 py-2 text-[13px] text-[var(--fg-3)] transition-colors hover:text-[var(--sai-red)]">Cancel</button>
          </div>
        </div>
        <div className="my-5 h-px bg-[var(--panel-fill-2)]" />
        <div className="grid gap-5 sm:grid-cols-3">
          <Meter label="AI generations" value={`${used} / ${total}`} total={Math.round((used / total) * 100)} note={`${total - used} remaining this month`} />
          <Meter label="Connected accounts" value="2 / 7" total={28} note="5 slots remaining" />
          <Meter label="Ghost Mode agents" value="1 / 1" total={100} note="Upgrade to Advanced for more" />
        </div>
      </GlassCard>

      {/* Top-up */}
      <GlassCard className="mb-5 p-6">
        <div className="mb-4">
          <h3 className="font-display flex items-center gap-2 text-[15px] font-semibold text-[var(--fg)]"><TrendingUp className="h-4 w-4 text-[var(--sai-violet)]" /> Need more generations?</h3>
          <p className="text-[13px] text-[var(--fg-3)]">One-time top-up packs — never expire within your billing cycle.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TOPUP_PACKS.map((p, i) => (
            <div key={i} className="relative rounded-2xl border p-4" style={{ borderColor: p.tag ? "rgba(99,102,241,0.4)" : "var(--panel-fill-2)", background: p.tag ? "rgba(99,102,241,0.06)" : "var(--panel-fill)" }}>
              {p.tag && <span className="font-data absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--fg)]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>{p.tag}</span>}
              <div className="font-display text-2xl font-semibold text-[var(--fg)]">{p.credits}</div>
              <div className="text-[12px] text-[var(--fg-4)]">AI generations</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--fg)]">{p.price}</span>
                <button className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[var(--fg)]" style={p.tag ? { background: "linear-gradient(135deg,#6366f1,#a855f7)" } : { background: "var(--panel-fill-2)", border: "1px solid var(--stroke)" }}>Buy now</button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Plans */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">All plans</h3>
        <div className="inline-flex rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] p-0.5 text-[12px]">
          {(["monthly", "annual"] as const).map((c) => (
            <button key={c} onClick={() => setCycle(c)} className="rounded-full px-3 py-1.5 transition-colors" style={cycle === c ? { background: "rgba(99,102,241,0.2)", color: "#fff" } : { color: "var(--fg-3)" }}>
              {c === "annual" ? "Annual · save 20%" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const active = plan.id === currentPlan;
          const price = cycle === "annual" && plan.price !== "₦0" ? plan.price.replace(/\d+/, (n) => String(Math.round(parseInt(n) * 0.8))) : plan.price;
          return (
            <GlassCard key={plan.id} className="relative flex flex-col p-5" style={active ? { borderColor: "rgba(99,102,241,0.5)", boxShadow: "0 20px 60px -30px rgba(99,102,241,0.8)" } : undefined}>
              {active && <span className="font-data absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--fg)]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Current</span>}
              {plan.popular && !active && <span className="font-data absolute -top-2.5 left-4 rounded-full border border-[var(--sai-indigo)]/40 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--sai-indigo)]">Popular</span>}
              <div className="flex items-center gap-2"><plan.icon className="h-4 w-4 text-[var(--sai-indigo)]" /><span className="text-sm font-medium text-[var(--fg)]">{plan.name}</span></div>
              <div className="mt-3"><span className="font-display text-2xl font-semibold text-[var(--fg)]">{price}</span><span className="text-[12px] text-[var(--fg-4)]">{plan.period}</span></div>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f, i) => (<li key={i} className="flex items-start gap-1.5 text-[12.5px] text-[var(--fg-2)]"><Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--sai-violet)]" /><span>{f}</span></li>))}
              </ul>
              <button disabled={active} className="mt-4 w-full rounded-full py-2 text-[12.5px] font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100" style={active ? { background: "var(--panel-fill-2)", border: "1px solid var(--stroke)", color: "#fff" } : { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff" }}>
                {active ? "Current plan" : `Switch to ${plan.name}`}
              </button>
            </GlassCard>
          );
        })}
      </div>

      {/* Payment method */}
      <GlassCard className="mb-5 p-6">
        <h3 className="font-display mb-4 flex items-center gap-2 text-[15px] font-semibold text-[var(--fg)]"><CreditCard className="h-4 w-4 text-[var(--fg-3)]" /> Payment method</h3>
        <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-10 items-center justify-center rounded" style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}><span className="text-[9px] font-black text-[var(--fg)]">VISA</span></div>
            <div><p className="text-sm font-medium text-[var(--fg)]">•••• •••• •••• 4832</p><p className="text-[12px] text-[var(--fg-4)]">Expires 09/28</p></div>
          </div>
          <div className="flex items-center gap-2"><Pill tone="indigo">Default</Pill><button className="rounded-full px-3 py-1.5 text-[12px] text-[var(--fg-2)] hover:text-[var(--fg)]">Update</button></div>
        </div>
        <div className="mt-3 flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5 text-[var(--fg-4)]" /><p className="text-[12px] text-[var(--fg-4)]">Payments processed securely via Paystack & Flutterwave. We never store card details.</p></div>
      </GlassCard>

      {/* Invoices */}
      <GlassCard className="p-6">
        <h3 className="font-display mb-4 text-[15px] font-semibold text-[var(--fg)]">Invoice history</h3>
        <div>
          {INVOICES.map((inv, i) => (
            <div key={i} className="flex items-center justify-between border-b border-[var(--stroke)] py-3 last:border-0">
              <div className="flex items-center gap-3"><span className="text-sm font-medium text-[var(--fg)]">{inv.date}</span><Pill tone="muted">{inv.plan}</Pill></div>
              <div className="flex items-center gap-4"><span className="text-sm font-semibold text-[var(--fg)]">{inv.amount}</span><Pill tone="green">{inv.status}</Pill><button className="flex items-center gap-1 rounded-full px-2 py-1 text-[12px] text-[var(--fg-3)] hover:text-[var(--fg)]"><ArrowUpRight className="h-3 w-3" /> PDF</button></div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
