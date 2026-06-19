"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGOS = ["Vortex", "Nimbus", "Prysma", "Cirrus", "Kynder", "Halcyn"];

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

        {/* Blurred overlay shape — centred behind content */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 pointer-events-none"
          style={{ filter: "blur(82px)", zIndex: 0 }}
        />

        {/* ── Navbar ── */}
        <nav className="relative z-10 flex items-center justify-between py-5 px-8">
          {/* Logo text — no image file exists yet */}
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "hsl(40 6% 95%)" }}
          >
            SociallyAI
          </span>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(({ label, hasChevron }) => (
              <button
                key={label}
                className="flex items-center gap-1 text-sm transition-colors"
                style={{ color: "hsl(40 6% 95% / 0.9)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(40 6% 95%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsl(40 6% 95% / 0.9)")}
              >
                {label}
                {hasChevron && <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {/* Sign Up */}
          <Button variant="heroSecondary" className="px-4 py-2 text-sm">
            Sign Up
          </Button>
        </nav>

        {/* Navbar divider */}
        <div
          className="relative z-10 h-px w-full mt-[3px]"
          style={{
            background:
              "linear-gradient(to right, transparent, hsl(40 6% 95% / 0.2), transparent)",
          }}
        />

        {/* ── Main headline area ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8" style={{ overflow: "visible" }}>
          <div className="text-center">
            {/* "Power AI" headline */}
            <h1
              className="font-normal leading-[1.02] tracking-[-0.024em]"
              style={{
                fontFamily: "'General Sans', var(--font-geist-sans), sans-serif",
                fontSize: "clamp(64px, 14vw, 220px)",
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
              className="text-lg leading-8 max-w-md mx-auto mt-[9px]"
              style={{ color: "hsl(40 6% 82%)", opacity: 0.8 }}
            >
              The most powerful AI ever deployed<br />
              in talent acquisition
            </p>

            {/* CTA */}
            <Button
              variant="heroSecondary"
              className="mt-[25px] text-base"
              style={{ padding: "24px 29px" }}
            >
              Schedule a Consult
            </Button>
          </div>
        </div>

        {/* ── Logo marquee — pinned to bottom ── */}
        <div className="relative z-10 pb-10 px-8">
          <div className="max-w-5xl mx-auto flex items-center gap-12">
            {/* Static label */}
            <p
              className="text-sm flex-shrink-0 leading-5"
              style={{ color: "hsl(40 6% 95% / 0.5)" }}
            >
              Relied on by brands<br />across the globe
            </p>

            {/* Scrolling marquee */}
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-16 animate-marquee">
                {[...LOGOS, ...LOGOS].map((name, i) => (
                  <div key={i} className="flex items-center gap-3 flex-shrink-0">
                    <div className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white">
                      {name[0]}
                    </div>
                    <span
                      className="text-base font-semibold whitespace-nowrap"
                      style={{ color: "hsl(40 6% 95%)" }}
                    >
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
