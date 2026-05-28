"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  Play,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingOrbs } from "./AnimatedBackground";

const PLATFORMS = [
  { name: "X (Twitter)", color: "#1DA1F2", letter: "X" },
  { name: "LinkedIn", color: "#0077B5", letter: "in" },
  { name: "Instagram", color: "#E1306C", letter: "IG" },
  { name: "TikTok", color: "#010101", letter: "TT" },
];

const STATS = [
  { value: "10x", label: "Faster content creation" },
  { value: "3.4x", label: "Avg engagement boost" },
  { value: "₦0", label: "Per-token cost (self-hosted)" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      <FloatingOrbs />

      {/* Spotlight beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-80 opacity-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent, #7c3aed, transparent)",
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 blur-[80px]"
        style={{
          background:
            "radial-gradient(ellipse at top, #7c3aed 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Announcement badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              Powered by Gemma AI — Zero per-token API fees
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
        >
          <span className="text-foreground">Stop Managing</span>
          <br />
          <span className="gradient-text">Social Media.</span>
          <br />
          <span className="text-foreground">Start Delegating It.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          SociallyAI deploys autonomous AI agents that create content, engage
          your followers, predict viral trends, and convert likes into real
          revenue — 24/7, at a price built for the African market.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link href="/signup">
            <Button variant="gradient" size="xl" className="group w-full sm:w-auto">
              Start free — no credit card
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors group">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-500/10 transition-all">
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </div>
            <span className="text-sm font-medium">Watch demo (2 min)</span>
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 text-yellow-400 fill-yellow-400"
              />
            ))}
            <span className="ml-2">4.9/5 from 200+ creators</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div>
            <span className="text-foreground font-medium">2,000+</span> accounts
            managed
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div>
            Accepts{" "}
            <span className="text-foreground font-medium">Paystack & Flutterwave</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-3 gap-8 max-w-xl mx-auto mb-16"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Platform pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <span className="text-xs text-muted-foreground mr-2">
            Connects to:
          </span>
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span
                className="text-xs font-bold"
                style={{ color: p.color !== "#010101" ? p.color : undefined }}
              >
                {p.letter}
              </span>
              {p.name}
            </div>
          ))}
          <Badge variant="purple" className="text-xs">
            + more coming
          </Badge>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-6 h-10 rounded-full border border-border/50 flex items-start justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2.5 rounded-full bg-muted-foreground"
          />
        </div>
      </motion.div>
    </section>
  );
}
