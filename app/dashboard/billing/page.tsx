"use client";

import { useState } from "react";
import { CreditCard, Check, Zap, Crown, Rocket, Shield, ArrowUpRight, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",    name: "Free",     icon: Zap,    price: "₦0",      period: "/month",
    accounts: 1,  generations: "7/week",   color: "text-muted-foreground",
    features: ["1 social account", "Basic scheduling", "7 AI generations/week"],
  },
  {
    id: "basic",   name: "Basic",    icon: Shield, price: "₦5,000",  period: "/month",
    accounts: 3,  generations: "100/month", color: "text-red-400",
    features: ["3 social accounts", "Brand Voice setup", "Trend Discovery", "100 AI generations/month"],
  },
  {
    id: "pro",     name: "Pro",      icon: Rocket, price: "₦12,000", period: "/month",
    accounts: 7,  generations: "500/month", color: "text-red-400", popular: true,
    features: ["7 social accounts", "1 Ghost Mode Agent", "ROI Pulse tracking", "Auto-Plug Loop", "500 AI generations/month", "Team seats (2)"],
  },
  {
    id: "advanced",name: "Advanced", icon: Crown,  price: "₦25,000", period: "/month",
    accounts: 15, generations: "1,000/month", color: "text-red-400",
    features: ["15+ social accounts", "3 Autonomous Agents", "Smart Inbox Triage", "White-label reports", "API access", "1,000 AI generations/month", "5 team seats"],
  },
];

const INVOICES = [
  { date: "May 1, 2026",  amount: "₦12,000", plan: "Pro",   status: "Paid" },
  { date: "Apr 1, 2026",  amount: "₦12,000", plan: "Pro",   status: "Paid" },
  { date: "Mar 1, 2026",  amount: "₦5,000",  plan: "Basic", status: "Paid" },
  { date: "Feb 1, 2026",  amount: "₦0",      plan: "Free",  status: "Paid" },
];

const TOPUP_PACKS = [
  { credits: 50,  price: "₦1,500",  tag: null          },
  { credits: 200, price: "₦5,000",  tag: "Best Value"  },
  { credits: 500, price: "₦10,000", tag: null          },
];

export default function BillingPage() {
  const [currentPlan]   = useState("pro");
  const [billingCycle,   setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const usedGenerations  = 312;
  const totalGenerations = 500;
  const usagePct         = Math.round((usedGenerations / totalGenerations) * 100);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-muted-foreground" />
          Billing &amp; Plans
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your subscription, usage, and payment methods
        </p>
      </div>

      {/* Current plan summary */}
      <div className="p-6 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/25 to-card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-lg">Pro Plan</span>
              <Badge variant="red">Active</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Renews on <span className="text-foreground font-medium">June 1, 2026</span> · ₦12,000/month
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Change plan
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive">
              Cancel
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">AI Generations</span>
              <span className="font-medium">{usedGenerations} / {totalGenerations}</span>
            </div>
            <Progress value={usagePct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{totalGenerations - usedGenerations} remaining this month</p>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Connected Accounts</span>
              <span className="font-medium">2 / 7</span>
            </div>
            <Progress value={28} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">5 account slots remaining</p>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Ghost Mode Agents</span>
              <span className="font-medium">1 / 1</span>
            </div>
            <Progress value={100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Upgrade to Advanced for more agents</p>
          </div>
        </div>
      </div>

      {/* Top-up packs */}
      <div className="p-6 rounded-xl border border-border bg-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              Need more generations?
            </h3>
            <p className="text-sm text-muted-foreground">One-time top-up packs — never expire within your billing cycle</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {TOPUP_PACKS.map((pack, i) => (
            <div
              key={i}
              className={cn(
                "relative p-4 rounded-xl border transition-colors hover:border-red-500/30 cursor-pointer group",
                pack.tag ? "border-red-500/30 bg-red-500/5" : "border-border"
              )}
            >
              {pack.tag && (
                <div className="absolute -top-2.5 left-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white">
                    {pack.tag}
                  </span>
                </div>
              )}
              <div className="text-2xl font-bold mb-0.5">{pack.credits}</div>
              <div className="text-xs text-muted-foreground mb-3">AI generations</div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{pack.price}</span>
                <Button size="sm" variant={pack.tag ? "gradient" : "outline"} className="h-7 text-xs px-3">
                  Buy now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">All plans</h3>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
          {(["monthly", "annual"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                billingCycle === cycle ? "bg-background shadow text-foreground" : "text-muted-foreground"
              )}
            >
              {cycle === "annual" ? "Annual (save 20%)" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {PLANS.map((plan) => {
          const isActive = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative p-5 rounded-xl border flex flex-col transition-all",
                isActive ? "border-red-500/50 bg-red-500/5" : "border-border bg-card hover:border-red-500/20"
              )}
            >
              {isActive && (
                <div className="absolute -top-2.5 left-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white">
                    Current plan
                  </span>
                </div>
              )}
              {(plan as { popular?: boolean }).popular && !isActive && (
                <div className="absolute -top-2.5 left-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border border-red-500/30 text-red-400">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <plan.icon className={`w-4 h-4 ${plan.color}`} />
                <span className="font-semibold text-sm">{plan.name}</span>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold">
                  {billingCycle === "annual"
                    ? plan.price === "₦0" ? "₦0"
                      : plan.price.replace(/\d+/, (n) => String(Math.round(parseInt(n) * 0.8)))
                    : plan.price}
                </span>
                <span className="text-muted-foreground text-xs">{plan.period}</span>
              </div>

              <ul className="flex-1 space-y-2 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button variant={isActive ? "outline" : "gradient"} size="sm" className="w-full text-xs" disabled={isActive}>
                {isActive ? "Current plan" : `Switch to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Payment method */}
      <div className="p-6 rounded-xl border border-border bg-card mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          Payment Method
        </h3>
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
              <span className="text-white text-[9px] font-black">VISA</span>
            </div>
            <div>
              <p className="text-sm font-medium">•••• •••• •••• 4832</p>
              <p className="text-xs text-muted-foreground">Expires 09/28</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="red" className="text-xs">Default</Badge>
            <Button variant="ghost" size="sm" className="text-xs h-7">Update</Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Payments processed securely via Paystack. We never store card details.
          </p>
        </div>
      </div>

      {/* Invoice history */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Invoice History</h3>
        <div className="space-y-2">
          {INVOICES.map((inv, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">{inv.date}</div>
                <Badge variant="secondary" className="text-xs">{inv.plan}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">{inv.amount}</span>
                <Badge variant="red" className="text-xs">{inv.status}</Badge>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                  <ArrowUpRight className="w-3 h-3" />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
