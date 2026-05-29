"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap, Shield, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    icon: Zap,
    price: "₦0",
    period: "/month",
    desc: "Perfect for creators just getting started",
    badge: null,
    highlight: false,
    accounts: "1 social account",
    ai: "Gemma 2B — 7 generations/week",
    features: [
      "Basic post scheduling",
      "Simple analytics dashboard",
      "Content calendar view",
      "Mobile responsive app",
    ],
    cta: "Start free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Basic",
    icon: Shield,
    price: "₦5,000",
    period: "/month",
    desc: "For creators building their brand presence",
    badge: null,
    highlight: false,
    accounts: "3 social accounts",
    ai: "Gemma 9B — 100 generations/month",
    features: [
      "Everything in Free",
      "Website-to-Voice onboarding",
      "Psychological copywriting frameworks",
      "Trend discovery engine",
      "Platform-specific formatting",
      "Performance predictions",
    ],
    cta: "Get Basic",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    icon: Rocket,
    price: "₦12,000",
    period: "/month",
    desc: "For businesses ready to automate growth",
    badge: "Most Popular",
    highlight: true,
    accounts: "7 social accounts",
    ai: "Gemma 9B/27B — 500 gen/month",
    features: [
      "Everything in Basic",
      "1 Active Ghost Mode™ Agent",
      "Auto-Plug monetization loop",
      "Trend-to-Draft engine",
      "ROI Pulse tracking",
      "Team collaboration (2 seats)",
      "Competitor tracking",
      "Priority support",
    ],
    cta: "Start Pro",
    ctaVariant: "gradient" as const,
  },
  {
    name: "Advanced",
    icon: Crown,
    price: "₦25,000",
    period: "/month",
    desc: "For agencies managing multiple clients",
    badge: "Best for Agencies",
    highlight: false,
    accounts: "15+ social accounts",
    ai: "Full Agent Suite — 1,000 gen/month",
    features: [
      "Everything in Pro",
      "3 Autonomous Agents",
      "Smart Inbox Triage (AI-sorted leads)",
      "White-label client reports",
      "API access",
      "Custom webhook integrations",
      "5 team seats",
      "Dedicated success manager",
    ],
    cta: "Get Advanced",
    ctaVariant: "outline" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" />
            Pricing built for the African market
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            The power of a full
            <br />
            <span className="gradient-text">marketing team.</span> For less.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No hidden fees. No USD conversion surprises. Accepts Paystack,
            Flutterwave, and all Nigerian bank cards.
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-all duration-300",
                plan.highlight
                  ? "border-red-500/50 bg-gradient-to-b from-red-950/40 to-card shadow-xl shadow-red-500/10 scale-[1.02]"
                  : "border-border bg-card hover:border-red-500/20 hover:shadow-lg hover:shadow-red-500/5"
              )}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <plan.icon
                    className={cn(
                      "w-5 h-5",
                      plan.highlight ? "text-red-400" : "text-muted-foreground"
                    )}
                  />
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
              </div>

              {/* AI tier */}
              <div className="mb-5 p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">AI Engine</p>
                <p className="text-xs text-foreground">{plan.ai}</p>
              </div>

              {/* Accounts */}
              <div className="mb-5">
                <Badge variant="blue" className="text-xs">{plan.accounts}</Badge>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check
                      className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0",
                        plan.highlight ? "text-red-400" : "text-green-500"
                      )}
                    />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href="/signup">
                <Button variant={plan.ctaVariant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          All plans include a 14-day free trial. Cancel anytime. Need more
          generations? Top-up credit packs available in-app.
        </motion.p>
      </div>
    </section>
  );
}
