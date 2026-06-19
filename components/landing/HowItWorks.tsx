"use client";

import { motion } from "framer-motion";
import { Link2, Brain, Send, BarChart3, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Link2,
    title: "Connect Your Accounts",
    desc: "Link your X, LinkedIn, Instagram, and TikTok accounts in seconds. SociallyAI handles OAuth securely — we never store your credentials.",
    detail: "Secure OAuth 2.0 — no passwords stored",
  },
  {
    step: "02",
    icon: Brain,
    title: "Train Your Brand Voice",
    desc: "Paste your website URL or upload past posts. Our AI extracts your tone, vocabulary, and core messaging in 60 seconds. No writing required.",
    detail: "Powered by Llama 3.3 70B — self-hosted AI",
  },
  {
    step: "03",
    icon: Send,
    title: "Schedule, Approve & Deploy",
    desc: "Review AI-drafted posts, approve with one click, or let Ghost Mode handle engagement autonomously while you focus on your business.",
    detail: "Human-in-the-loop control always available",
  },
  {
    step: "04",
    icon: BarChart3,
    title: "Watch ROI Grow",
    desc: "Track performance with the ROI Pulse dashboard. See which posts drove real revenue — not just vanity metrics.",
    detail: "UTM tracking + conversion attribution",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm mb-6">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Up and running in minutes
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            From zero to
            <span className="gradient-text"> fully automated</span>
            <br />
            in 4 steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No complex setup. No developer needed. Just connect, configure, and
            let the AI take the wheel.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-indigo-500/60 via-purple-500/30 to-transparent hidden md:block" />

          <div className="flex flex-col gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6 group"
              >
                {/* Step icon */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform duration-200">
                    <step.icon className="w-7 h-7 text-red-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold tracking-widest gradient-text">
                      STEP {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-foreground transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    {step.desc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {step.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
