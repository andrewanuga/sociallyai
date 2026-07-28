import Link from "next/link";
import { ArrowLeft, Sparkles, Ghost, LineChart } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Sparkles, text: "Drafts in your voice, the moment a trend breaks" },
  { icon: Ghost, text: "Ghost Mode replies to noise, escalates real leads" },
  { icon: LineChart, text: "See which posts drove revenue — not vanity metrics" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row" style={{ background: "#121212" }}>
      {/* Ambient blooms */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-40 blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)" }}
        />
        <div
          className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3), transparent 70%)" }}
        />
      </div>

      {/* ── Brand panel (desktop) ── */}
      <aside className="relative hidden w-[46%] flex-col justify-between p-14 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={26} height={23} className="h-[24px] w-auto" />
          <span className="font-display text-lg font-semibold text-white">
            Socially<span className="text-[var(--sai-indigo)]"> AI</span>
          </span>
        </Link>

        <div>
          <h2
            className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.02em] text-white xl:text-6xl"
            style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
          >
            Social,
            <br />
            <span className="sai-gradient-text">understood.</span>
          </h2>
          <p className="mt-5 max-w-sm text-white/55">
            Deploy a personal agent that creates, engages, and converts — around
            the clock.
          </p>

          <ul className="mt-10 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                  <h.icon className="h-4 w-4 text-[var(--sai-indigo)]" />
                </span>
                <span className="text-sm leading-relaxed text-white/70">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-data text-[11px] uppercase tracking-[0.2em] text-white/30">
          Powered by Llama 3.3 70B
        </p>
      </aside>

      {/* ── Form panel ── */}
      <main className="relative flex flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={24} height={21} className="h-[22px] w-auto" />
            <span className="font-display text-[15px] font-semibold text-white">
              Socially<span className="text-[var(--sai-indigo)]"> AI</span>
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>

        {/* Desktop back link */}
        <Link
          href="/"
          className="absolute right-8 top-8 hidden items-center gap-1.5 text-[13px] text-white/50 transition-colors hover:text-white lg:flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>

        <div className="flex flex-1 items-center justify-center px-5 py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
