"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Link,
  TrendingUp,
  ShoppingCart,
  MousePointerClick,
  ArrowUpRight,
} from "lucide-react";

const ATTRIBUTION_EXAMPLES = [
  {
    post: "Tuesday LinkedIn post: '5 mistakes founders make with social media'",
    platform: "LinkedIn",
    clicks: 47,
    conversions: 8,
    revenue: "₦184,000",
    lift: "+38%",
  },
  {
    post: "X thread: 'How we grew 10k followers in 60 days'",
    platform: "X (Twitter)",
    clicks: 112,
    conversions: 14,
    revenue: "₦322,000",
    lift: "+61%",
  },
  {
    post: "Instagram Reel: 'Day in the life of a digital creator'",
    platform: "Instagram",
    clicks: 203,
    conversions: 22,
    revenue: "₦506,000",
    lift: "+82%",
  },
];

export function ROIPulse() {
  return (
    <section id="roi-pulse" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm mb-6">
              <DollarSign className="w-3.5 h-3.5" />
              Introducing ROI Pulse™
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Finally know which posts
              <br />
              <span className="gradient-text">actually made you money.</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Every other tool shows you vanity metrics — likes, impressions,
              reach. SociallyAI tracks the full funnel from post to payment.
            </p>

            <div className="space-y-5 mb-10">
              {[
                {
                  icon: Link,
                  title: "Auto-injected tracked links",
                  desc: "Every post SociallyAI schedules gets a unique UTM link automatically. No manual setup.",
                },
                {
                  icon: MousePointerClick,
                  title: "Click-to-conversion attribution",
                  desc: "We track which clicks landed on your Gumroad, Shopify, or landing page — and whether they converted.",
                },
                {
                  icon: ShoppingCart,
                  title: "Revenue estimation",
                  desc: "See estimated ₦ revenue per post in your dashboard. Screenshot it. Send it to your clients.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <item.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-0.5">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground italic">
              &ldquo;ROI Pulse turned our SociallyAI subscription from a cost into an
              investment. We showed a client ₦2.4M in tracked revenue from 3
              posts.&rdquo;
              <br />
              <span className="not-italic font-medium text-foreground">
                — Beta user, Lagos digital agency
              </span>
            </p>
          </motion.div>

          {/* Right — Attribution cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Header card */}
            <div className="p-5 rounded-2xl border border-red-500/20 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    This month&apos;s attributed revenue
                  </p>
                  <p className="text-3xl font-bold text-red-400">₦1,012,000</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  +127% vs last month
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "74%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">74% of monthly goal</p>
            </div>

            {/* Attribution items */}
            {ATTRIBUTION_EXAMPLES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="p-4 rounded-xl border border-border bg-card hover:border-red-500/25 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-foreground transition-colors">
                      {item.post}
                    </p>
                    <span className="text-xs text-muted-foreground">{item.platform}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-400 text-xs font-medium flex-shrink-0">
                    <ArrowUpRight className="w-3 h-3" />
                    {item.lift}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="text-foreground font-medium">{item.clicks}</span> clicks
                  </span>
                  <span>→</span>
                  <span>
                    <span className="text-foreground font-medium">{item.conversions}</span> conversions
                  </span>
                  <span>→</span>
                  <span className="text-red-400 font-semibold">{item.revenue}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
