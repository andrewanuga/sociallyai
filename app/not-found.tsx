import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center"
      style={{ background: "#121212" }}
    >
      {/* Ambient blooms */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-40 blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)" }}
        />
        <div
          className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full opacity-30 blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.32), transparent 70%)" }}
        />
      </div>

      {/* subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 45%, #000, transparent)",
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Brand */}
        <Link href="/" className="mb-10 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={26} height={23} className="h-[24px] w-auto" style={{ filter: "drop-shadow(0 0 12px rgba(99,102,241,0.45))" }} />
          <span className="font-display text-lg font-semibold text-white">
            Socially<span className="text-[var(--sai-indigo)]"> AI</span>
          </span>
        </Link>

        {/* 404 */}
        <div
          className="font-display leading-none tracking-[-0.04em] sai-gradient-text"
          style={{ fontSize: "clamp(96px, 22vw, 200px)", fontWeight: 600 }}
        >
          404
        </div>

        <div className="glass-panel mt-2 flex items-center gap-2 rounded-full px-4 py-1.5">
          <Compass className="h-3.5 w-3.5 text-[var(--sai-violet)]" />
          <span className="font-data text-[11px] uppercase tracking-[0.22em] text-white/60">Off the map</span>
        </div>

        <h1 className="font-display mt-7 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
          This page went dark.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
          The link is broken or the page moved. Your agent is still running — let&apos;s get you back to it.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/">
            <button
              className="flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg,#6366f1 0%,#a855f7 60%,#f5c451 130%)", boxShadow: "0 0 40px -8px rgba(99,102,241,0.7)" }}
            >
              <Home className="h-4 w-4" /> Back home
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-7 py-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" /> Go to dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
