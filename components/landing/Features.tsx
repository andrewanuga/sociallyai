"use client";

import { motion } from "framer-motion";
import {
  Brain, Ghost, TrendingUp, DollarSign, MessageSquare,
  Calendar, Shield, Zap, Target, BarChart3, FileText, Globe,
} from "lucide-react";

const STANDARD_FEATURES = [
  {
    icon: Calendar,
    title: "Visual Content Calendar",
    desc: "Drag-and-drop scheduling with a bird's-eye monthly view. See your strategy at a glance.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: MessageSquare,
    title: "Unified Social Inbox",
    desc: "All DMs and comments from X, Instagram, LinkedIn, and TikTok in one responsive dashboard.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: FileText,
    title: "Auto-Repurposing Engine",
    desc: "Turn a YouTube link or blog post into a Twitter thread, LinkedIn post, and Reel script instantly.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Globe,
    title: "Optimal Timing Scheduler",
    desc: "Don't just post now — post when your specific audience is actively scrolling and engaged.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
];

const GAME_CHANGERS = [
  {
    icon: Brain,
    title: "Predictive Socially Score",
    desc: "Before you hit schedule, our AI analyzes your post history and current trends to give you an engagement probability score. No more guessing — know what will perform.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    glow: "hover:shadow-indigo-500/10",
    badge: "Pro",
  },
  {
    icon: Ghost,
    title: "Ghost Mode™ Agent",
    desc: "Deploy an AI agent that replies to surface-level comments in your voice, then escalates genuine leads and customer queries to your human dashboard. You only touch what matters.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    glow: "hover:shadow-purple-500/10",
    badge: "Pro",
  },
  {
    icon: TrendingUp,
    title: "Trend-to-Draft Engine",
    desc: "SociallyAI monitors trending topics in your niche and pre-writes 3 post options the moment something blows up. No blank page. No wasted viral moments.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    glow: "hover:shadow-indigo-500/10",
    badge: "Pro",
  },
  {
    icon: DollarSign,
    title: "Auto-Plug Monetization Loop",
    desc: "When a post hits your engagement threshold, your AI agent automatically drops a conversion comment plugging your product, newsletter, or link-in-bio.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    glow: "hover:shadow-amber-500/10",
    badge: "Pro",
  },
  {
    icon: Target,
    title: "Brand Voice Sovereignty",
    desc: "Paste your website URL and SociallyAI extracts your brand voice, vocabulary, and values in 60 seconds. Zero setup friction. The AI sounds like you, not a bot.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    glow: "hover:shadow-emerald-500/10",
    badge: "Basic+",
  },
  {
    icon: BarChart3,
    title: "Smart Inbox Triage",
    desc: "Llama AI clusters your comments by intent — Leads, Complaints, and Fluff. Spend 2 minutes on the 4 messages that make money and skip the 96 emojis.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    glow: "hover:shadow-orange-500/10",
    badge: "Advanced",
  },
];

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0  },
};

export function Features() {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" />
            Full Feature Suite
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Everything you need.
            <br />
            <span className="gradient-text">Then some.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Most tools tell you what happened. SociallyAI tells you what will
            happen — and often handles it before you even open the app.
          </p>
        </motion.div>

        {/* Standard features */}
        <div className="mb-16">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-border" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              The Must-Haves
            </p>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-border" />
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {STANDARD_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="p-5 rounded-xl border border-border bg-card hover:border-white/15 hover:shadow-lg transition-all duration-200 group relative overflow-hidden"
              >
                {/* subtle top-edge accent */}
                <div className={`absolute top-0 left-0 right-0 h-px ${f.bg} opacity-60`} />
                <div
                  className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Game changers */}
        <div>
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-border" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              The Game Changers
            </p>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-border" />
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {GAME_CHANGERS.map((f, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className={`relative p-6 rounded-xl border border-border bg-card hover:border-white/10 hover:shadow-xl ${f.glow} transition-all duration-300 group overflow-hidden`}
              >
                {/* Coloured top accent line */}
                <div className={`absolute top-0 inset-x-0 h-[2px] ${f.bg} opacity-80 group-hover:opacity-100 transition-opacity`} />
                {/* Hover inner glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-white/[0.025] to-transparent rounded-xl" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                    >
                      <f.icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.bg} ${f.color} border border-current/20`}>
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
