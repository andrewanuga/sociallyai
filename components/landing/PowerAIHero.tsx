"use client";

import { useEffect, useRef } from "react";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Features",  hasChevron: true  },
  { label: "Solutions", hasChevron: false },
  { label: "Plans",     hasChevron: false },
  { label: "Learning",  hasChevron: true  },
];

export function PowerAIHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const FADE_MS = 500;
    const fadingOut = { current: false };
    const raf = { current: 0 };

    function cancelAnim() {
      if (raf.current) cancelAnimationFrame(raf.current);
    }

    function fadeIn() {
      const start = performance.now();
      function tick(now: number) {
        const t = Math.min((now - start) / FADE_MS, 1);
        if (video) video.style.opacity = String(t);
        if (t < 1) raf.current = requestAnimationFrame(tick);
        else raf.current = 0;
      }
      raf.current = requestAnimationFrame(tick);
    }

    function startFadeOut() {
      if (fadingOut.current) return;
      fadingOut.current = true;
      cancelAnim();
      const start = performance.now();
      function tick(now: number) {
        const t = Math.min((now - start) / FADE_MS, 1);
        if (video) video.style.opacity = String(1 - t);
        if (t < 1) {
          raf.current = requestAnimationFrame(tick);
        } else {
          raf.current = 0;
          if (video) video.style.opacity = "0";
        }
      }
      raf.current = requestAnimationFrame(tick);
    }

    function onEnded() {
      if (!video) return;
      video.style.opacity = "0";
      fadingOut.current = false;
      cancelAnim();
      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        video.play().then(() => fadeIn()).catch(() => {});
      }, 100);
    }

    function onTimeUpdate() {
      if (!video || fadingOut.current) return;
      const remaining = video.duration - video.currentTime;
      if (remaining > 0 && remaining <= FADE_MS / 1000 + 0.05) {
        startFadeOut();
      }
    }

    video.style.opacity = "0";
    video.play().then(() => fadeIn()).catch(() => {});

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      cancelAnim();
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div
      className="relative overflow-hidden min-h-screen"
      style={{ background: "hsl(260 87% 3%)" }}
    >
      {/* Background video */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        style={{ opacity: 0 }}
      />

      {/* Content layer */}
      <div className="relative z-10 min-h-screen flex flex-col" style={{ overflow: "visible" }}>

        {/* Centred blur overlay behind content */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 pointer-events-none"
          style={{ filter: "blur(82px)", zIndex: 0 }}
        />

        {/* ── Navbar ── */}
        <nav className="relative z-10 flex items-center justify-between py-5 px-8">
          {/* Logo */}
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "hsl(40 6% 95%)" }}
          >
            Socially<span style={{ color: "#818cf8" }}>AI</span>
          </span>

          {/* Nav links — hidden on small screens */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map(({ label, hasChevron }) => (
              <button
                key={label}
                className="flex items-center gap-1 text-sm transition-colors duration-150"
                style={{ color: "hsla(40,6%,95%,0.75)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(40 6% 95%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsla(40,6%,95%,0.75)")}
              >
                {label}
                {hasChevron && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </button>
            ))}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button
                className="hidden sm:block text-sm px-4 py-2 transition-colors duration-150"
                style={{ color: "hsla(40,6%,95%,0.7)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(40 6% 95%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsla(40,6%,95%,0.7)")}
              >
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button
                className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  background: "rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99,102,241,0.35)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.35)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.6)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.2)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
                }}
              >
                Sign Up
              </button>
            </Link>
          </div>
        </nav>

        {/* Navbar divider */}
        <div
          className="relative z-10 h-px w-full"
          style={{ background: "linear-gradient(to right, transparent, hsla(40,6%,95%,0.12), transparent)" }}
        />

        {/* ── Headline area — vertically centred ── */}
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6"
          style={{ overflow: "visible", paddingTop: "2rem", paddingBottom: "3rem" }}
        >
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Llama 3.3 70B
          </div>

          {/* "Power AI" headline */}
          <h1
            className="font-normal leading-[1.02] tracking-[-0.024em]"
            style={{
              fontFamily: "'General Sans', var(--font-geist-sans), sans-serif",
              fontSize: "clamp(56px, 13vw, 220px)",
              color: "hsl(40 6% 95%)",
            }}
          >
            Power{" "}
            <span
              style={{
                background: "linear-gradient(to left, #6366f1, #a855f7, #fcd34d)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg leading-8 max-w-lg mx-auto mt-5"
            style={{ color: "hsl(40 6% 82%)", opacity: 0.8 }}
          >
            The most powerful AI social media system ever deployed —
            automate content, engage followers, and turn attention into revenue.
          </p>

          {/* Dual CTA row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            {/* Primary CTA */}
            <Link href="/signup">
              <button
                className="flex items-center gap-2 rounded-full font-semibold text-white transition-all duration-200 hover:scale-[1.03]"
                style={{
                  padding: "14px 32px",
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 60%, #f59e0b 100%)",
                  boxShadow: "0 0 32px rgba(99,102,241,0.35)",
                  fontSize: "1rem",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 48px rgba(99,102,241,0.55)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 32px rgba(99,102,241,0.35)"; }}
              >
                Schedule a Consultant
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            {/* Secondary CTA */}
            <Link href="/signup">
              <button
                className="flex items-center gap-2 rounded-full font-medium transition-all duration-200"
                style={{
                  padding: "14px 32px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "hsl(40 6% 95%)",
                  fontSize: "1rem",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
              >
                Join Now
              </button>
            </Link>
          </div>

          {/* Social proof line */}
          <p
            className="mt-6 text-sm"
            style={{ color: "hsla(40,6%,95%,0.4)" }}
          >
            Join 2,000+ creators and businesses — no credit card required
          </p>
        </div>

      </div>
    </div>
  );
}
