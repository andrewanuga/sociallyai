"use client";

import Link from "next/link";
import {
  Brain, Ghost, TrendingUp, DollarSign, Target, BarChart3,
  Calendar, MessageSquare, FileText, Clock,
  Link2, Sparkles, Send, LineChart,
  ArrowRight, Check, Star,
} from "lucide-react";
import { useGsapReveal } from "./useGsapReveal";

/* ── Shared bits ─────────────────────────────────────────────────── */

function Eyebrow({ children, tone = "indigo" }: { children: React.ReactNode; tone?: "indigo" | "violet" | "gold" }) {
  const color =
    tone === "violet" ? "var(--sai-violet)" : tone === "gold" ? "var(--sai-gold)" : "var(--sai-indigo)";
  return (
    <span
      className="font-data inline-block text-[11px] uppercase tracking-[0.24em]"
      style={{ color }}
    >
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow, tone, title, sub,
}: { eyebrow: string; tone?: "indigo" | "violet" | "gold"; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto mb-16 max-w-2xl text-center">
      <div data-reveal><Eyebrow tone={tone}>{eyebrow}</Eyebrow></div>
      <h2
        data-reveal
        className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl"
      >
        {title}
      </h2>
      {sub && (
        <p data-reveal className="mt-5 text-base leading-relaxed text-white/55 sm:text-lg">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Features ────────────────────────────────────────────────────── */

const MUST_HAVES = [
  { icon: Calendar, title: "Visual calendar", desc: "Drag-and-drop scheduling. Your whole strategy at a glance." },
  { icon: MessageSquare, title: "Unified inbox", desc: "Every DM and comment from X, Instagram, LinkedIn, TikTok — one view." },
  { icon: FileText, title: "Auto-repurposing", desc: "One link becomes a thread, a post, and a reel script instantly." },
  { icon: Clock, title: "Optimal timing", desc: "Post when your audience is actually scrolling, not just now." },
];

const GAME_CHANGERS = [
  { icon: Brain, title: "Predictive Socially Score", desc: "Know a post's engagement odds before you schedule. No more guessing.", tone: "indigo", badge: "Pro" },
  { icon: Ghost, title: "Ghost Mode™ Agent", desc: "Replies to the noise in your voice, escalates real leads to you.", tone: "violet", badge: "Pro" },
  { icon: TrendingUp, title: "Trend-to-Draft", desc: "Three drafts waiting the moment something breaks in your niche.", tone: "indigo", badge: "Pro" },
  { icon: DollarSign, title: "Auto-Plug Loop", desc: "Hits your threshold, drops the conversion comment automatically.", tone: "gold", badge: "Pro" },
  { icon: Target, title: "Brand Voice", desc: "Paste a URL. It sounds like you in sixty seconds. Not a bot.", tone: "violet", badge: "Basic+" },
  { icon: BarChart3, title: "Smart Inbox Triage", desc: "Leads, complaints, fluff — sorted. Spend minutes, not hours.", tone: "indigo", badge: "Advanced" },
];

const toneColor = (t?: string) =>
  t === "violet" ? "var(--sai-violet)" : t === "gold" ? "var(--sai-gold)" : "var(--sai-indigo)";

export function Features() {
  const ref = useGsapReveal<HTMLElement>();
  return (
    <section id="features" ref={ref} className="sai-vignette relative px-5 py-28 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Full feature suite"
          title={<>Everything you need.<br /><span className="sai-gradient-text">Then some.</span></>}
          sub="Most tools tell you what happened. Socially AI tells you what will — and often handles it before you open the app."
        />

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MUST_HAVES.map((f) => (
            <div
              key={f.title}
              data-reveal
              className="glass-panel group rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                <f.icon className="h-5 w-5 text-[var(--sai-indigo)]" />
              </div>
              <h3 className="font-display text-[15px] font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/55">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GAME_CHANGERS.map((f) => (
            <div
              key={f.title}
              data-reveal
              className="glass-panel group relative overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className="absolute inset-x-0 top-0 h-px opacity-70"
                style={{ background: `linear-gradient(90deg,transparent,${toneColor(f.tone)},transparent)` }}
              />
              <div className="flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `color-mix(in srgb, ${toneColor(f.tone)} 14%, transparent)` }}
                >
                  <f.icon className="h-6 w-6" style={{ color: toneColor(f.tone) }} />
                </div>
                <span
                  className="font-data rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider"
                  style={{ color: toneColor(f.tone), background: `color-mix(in srgb, ${toneColor(f.tone)} 12%, transparent)` }}
                >
                  {f.badge}
                </span>
              </div>
              <h3 className="font-display mt-5 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ────────────────────────────────────────────────── */

const STEPS = [
  { icon: Link2, title: "Connect your accounts", desc: "Link X, LinkedIn, Instagram, TikTok in seconds. Secure OAuth — no passwords stored.", tag: "OAuth 2.0" },
  { icon: Sparkles, title: "Train your voice", desc: "Paste a URL or past posts. It learns your tone in sixty seconds.", tag: "Llama 3.3 70B" },
  { icon: Send, title: "Approve & deploy", desc: "One-click approve, or let Ghost Mode run engagement autonomously.", tag: "Human-in-the-loop" },
  { icon: LineChart, title: "Watch ROI grow", desc: "See which posts drove revenue — not vanity metrics.", tag: "Conversion attribution" },
];

export function HowItWorks() {
  const ref = useGsapReveal<HTMLElement>();
  return (
    <section id="how" ref={ref} className="relative px-5 py-28 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHead
          eyebrow="Up and running in minutes"
          tone="violet"
          title={<>From zero to <span className="sai-gradient-text">fully automated</span></>}
          sub="No complex setup. No developer. Connect, configure, and let the agent take the wheel."
        />
        <div className="relative">
          <div className="absolute left-[27px] top-4 bottom-4 hidden w-px bg-gradient-to-b from-[var(--sai-indigo)]/50 via-[var(--sai-violet)]/25 to-transparent md:block" />
          <div className="flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <div key={s.title} data-reveal="left" className="glass-panel flex items-start gap-5 rounded-2xl p-6">
                <div className="relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <s.icon className="h-6 w-6 text-[var(--sai-violet)]" />
                </div>
                <div className="flex-1">
                  <div className="font-data text-[11px] uppercase tracking-[0.2em] text-white/40">Step 0{i + 1}</div>
                  <h3 className="font-display mt-1.5 text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{s.desc}</p>
                  <span className="font-data mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-[var(--sai-indigo)]">
                    <Check className="h-3 w-3" /> {s.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Stories (testimonials) ──────────────────────────────────────── */

const STORIES = [
  { name: "Adaeze Okonkwo", role: "Fintech Founder, Lagos", avatar: "AO", text: "I replaced Buffer and a freelance manager with Socially AI. Ghost Mode handles engagement while I close deals. ROI in week one.", highlight: "Replaced a freelance manager" },
  { name: "Chukwuemeka Dike", role: "Digital Agency, Abuja", avatar: "CD", text: "Eight client accounts used to need three people. Now it's me and the agent. Inbox Triage alone saves two hours a day.", highlight: "Manages 8 clients solo" },
  { name: "Fatima Al-Hassan", role: "E-commerce, Kano", avatar: "FA", text: "ROI Pulse is wild. I can show 'this post made us ₦340,000 this week.' The marketing budget stopped being a question.", highlight: "₦340k from one post" },
  { name: "Tunde Fashola", role: "Brand Coach, Lagos", avatar: "TF", text: "Trend-to-Draft is a ghostwriter that never sleeps. It caught the news cycle before I woke up — three drafts waiting.", highlight: "Trend content before it peaks" },
  { name: "Ngozi Eze", role: "Fashion, Port Harcourt", avatar: "NE", text: "I was skeptical about AI sounding like me. My followers can't tell. Engagement went up three times.", highlight: "3× engagement" },
  { name: "Biodun Afolabi", role: "SaaS Founder, Lagos", avatar: "BA", text: "They self-host Llama 3.3 70B, so my content data doesn't go to anyone else. And the pricing makes sense here.", highlight: "Privacy-first" },
];

function StoryCard({ t }: { t: (typeof STORIES)[number] }) {
  return (
    <div className="glass-panel w-[330px] flex-shrink-0 rounded-2xl p-6 sm:w-[380px]">
      <p className="text-sm leading-relaxed text-white/75">“{t.text}”</p>
      <div className="font-data mt-4 inline-block rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-[var(--sai-indigo)]">
        {t.highlight}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-[13px] font-medium text-white">{t.name}</p>
          <p className="text-[12px] text-white/45">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse }: { items: typeof STORIES; reverse?: boolean }) {
  // Duplicate the set so the -50% translate loops seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className="sai-marquee py-2">
      <div className={`sai-marquee-track${reverse ? " reverse" : ""}`}>
        {doubled.map((t, i) => (
          <StoryCard key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function Stories() {
  const ref = useGsapReveal<HTMLElement>();
  const rowA = STORIES.slice(0, 3);
  const rowB = STORIES.slice(3);
  return (
    <section id="stories" ref={ref} className="sai-vignette relative overflow-hidden py-28 sm:py-32">
      <div className="mx-auto mb-14 max-w-2xl px-5 text-center">
        <div data-reveal><Eyebrow tone="gold">Loved by operators</Eyebrow></div>
        <h2 data-reveal className="font-display mt-4 text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
          Creators & businesses<br /><span className="sai-gradient-text">love Socially AI</span>
        </h2>
        <div data-reveal className="mt-4 flex items-center justify-center gap-1.5 text-white/60">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-[var(--sai-gold)] text-[var(--sai-gold)]" />
          ))}
          <span className="ml-2 text-sm">4.9 / 5 average</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeRow items={rowA} />
        <MarqueeRow items={rowB} reverse />
      </div>
    </section>
  );
}

/* ── Pricing ─────────────────────────────────────────────────────── */

const PLANS = [
  { name: "Free", price: "₦0", desc: "For creators getting started", accounts: "1 account", features: ["Post scheduling", "Simple analytics", "Calendar view", "Mobile app"], cta: "Start free", highlight: false },
  { name: "Basic", price: "₦5,000", desc: "For building your presence", accounts: "3 accounts", features: ["Everything in Free", "Website-to-Voice", "Copywriting frameworks", "Trend discovery", "Performance predictions"], cta: "Get Basic", highlight: false },
  { name: "Pro", price: "₦12,000", desc: "For automating growth", accounts: "7 accounts", features: ["Everything in Basic", "1 Ghost Mode™ Agent", "Auto-Plug loop", "Trend-to-Draft", "ROI Pulse", "2 team seats"], cta: "Start Pro", highlight: true, badge: "Most popular" },
  { name: "Advanced", price: "₦25,000", desc: "For agencies at scale", accounts: "15+ accounts", features: ["Everything in Pro", "3 Autonomous Agents", "Smart Inbox Triage", "White-label reports", "API access", "5 team seats"], cta: "Get Advanced", highlight: false, badge: "For agencies" },
  { name: "Team Plan", price: "₦150,000", desc: "For ultimate collaboration", accounts: "50+ accounts", features: ["Unlimited team seats", "10 Autonomous Agents", "Custom API integration", "Priority support", "White-label reports", "Auto-Plug loop"], cta: "Get Team", highlight: false, badge: "No limits" },
];

export function Pricing() {
  const ref = useGsapReveal<HTMLElement>();
  return (
    <section id="pricing" ref={ref} className="relative px-5 py-28 sm:py-32">
      <div className="mx-auto max-w-[90rem]">
        <SectionHead
          eyebrow="Built for the African market"
          title={<>A full marketing team.<br /><span className="sai-gradient-text">For less.</span></>}
          sub="No hidden fees. No USD surprises. Paystack, Flutterwave, and all Nigerian cards."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PLANS.map((p) => (
            <div
              key={p.name}
              data-reveal
              className="glass-panel relative flex flex-col rounded-2xl p-6"
              style={p.highlight ? { borderColor: "rgba(99,102,241,0.5)", boxShadow: "0 24px 70px -30px rgba(99,102,241,0.8)" } : undefined}
            >
              {p.badge && (
                <span
                  className="font-data absolute -top-2.5 left-6 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider text-white"
                  style={{ background: p.highlight ? "linear-gradient(135deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.1)" }}
                >
                  {p.badge}
                </span>
              )}
              <div className="font-display text-sm font-medium text-white/70">{p.name}</div>
              <div className="mt-2 flex items-end gap-1">
                <span className="font-display text-3xl font-semibold text-white">{p.price}</span>
                <span className="mb-1 text-xs text-white/40">/mo</span>
              </div>
              <p className="mt-1.5 text-xs text-white/45">{p.desc}</p>
              <div className="font-data mt-4 inline-block w-fit rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-[var(--sai-indigo)]">
                {p.accounts}
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-white/60">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--sai-violet)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-7">
                <button
                  className="w-full rounded-full py-2.5 text-sm font-medium transition-transform duration-200 hover:scale-[1.02]"
                  style={
                    p.highlight
                      ? { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", boxShadow: "0 0 30px -8px rgba(99,102,241,0.7)" }
                      : { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }
                  }
                >
                  {p.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-white/40">
          Every plan includes a 14-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

/* ── Final CTA ───────────────────────────────────────────────────── */

export function FinalCTA() {
  const ref = useGsapReveal<HTMLElement>();
  return (
    <section ref={ref} className="relative px-5 py-32">
      <div
        className="glass-panel mx-auto max-w-4xl overflow-hidden rounded-[28px] px-6 py-20 text-center"
        style={{ background: "rgba(20,20,26,0.6)" }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(99,102,241,0.35), transparent 70%)" }}
        />
        <div data-reveal><Eyebrow>Free for 14 days — no card required</Eyebrow></div>
        <h2 data-reveal className="font-display mx-auto mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl">
          Your AI marketing team<br /><span className="sai-gradient-text">starts today.</span>
        </h2>
        <p data-reveal className="mx-auto mt-6 max-w-xl text-base text-white/60 sm:text-lg">
          Join 2,000+ creators and businesses who stopped posting manually and started delegating to AI.
        </p>
        <div data-reveal className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <button
              className="group flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg,#6366f1 0%,#a855f7 60%,#f5c451 130%)", boxShadow: "0 0 44px -8px rgba(99,102,241,0.7)" }}
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
          <Link href="/login">
            <button className="rounded-full border border-white/15 bg-white/[0.05] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Sign in to dashboard
            </button>
          </Link>
        </div>
        <p data-reveal className="mt-8 text-xs text-white/40">
          Then from ₦5,000/month. Paystack, Flutterwave, and all Nigerian cards.
        </p>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────── */

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-5 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={24} height={21} className="h-[22px] w-auto" />
          <span className="font-display text-[15px] font-semibold text-white">
            Socially<span className="text-[var(--sai-indigo)]"> AI</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-white/50">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
          <Link href="/login" className="transition-colors hover:text-white">Sign in</Link>
          <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-white/30 sm:text-left">
        © {new Date().getFullYear()} Socially AI — Personal Social Agent. Powered by Llama 3.3 70B.
      </p>
    </footer>
  );
}
