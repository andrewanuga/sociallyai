"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FRAME_COUNT,
  framePath,
  POSTER_START,
} from "@/lib/frames";

gsap.registerPlugin(ScrollTrigger);

const LAST = FRAME_COUNT - 1;

// Scroll length (in viewport heights) the hero is pinned for.
const SCRUB_VH_DESKTOP = 3.6;
const SCRUB_VH_MOBILE = 2.2;

export function CinematicHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const o1 = useRef<HTMLDivElement>(null);
  const o2 = useRef<HTMLDivElement>(null);
  const o3 = useRef<HTMLDivElement>(null);
  const o4 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    // ── Frame store with progressive loading + nearest-loaded fallback ──
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    let lastDrawn = -1;

    function loadFrame(i: number): Promise<void> {
      if (images[i]) return Promise.resolve();
      const img = new Image();
      images[i] = img;
      img.src = framePath(i + 1);
      const finish = () => {
        loaded[i] = true;
      };
      return (img.decode ? img.decode() : Promise.resolve())
        .then(finish)
        .catch(
          () =>
            new Promise<void>((res) => {
              img.onload = () => {
                finish();
                res();
              };
              img.onerror = () => res();
            })
        );
    }

    // Background-load every frame with light concurrency, warm frames first.
    async function preloadAll() {
      const order = Array.from({ length: FRAME_COUNT }, (_, i) => i);
      const CONCURRENCY = 6;
      let cursor = 0;
      async function worker() {
        while (cursor < order.length) {
          const i = order[cursor++];
          await loadFrame(i);
          if (i === nearestLoaded(currentIdx)) requestRender();
        }
      }
      await Promise.all(
        Array.from({ length: CONCURRENCY }, () => worker())
      );
    }

    function nearestLoaded(idx: number): number {
      if (loaded[idx]) return idx;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (idx - d >= 0 && loaded[idx - d]) return idx - d;
        if (idx + d < FRAME_COUNT && loaded[idx + d]) return idx + d;
      }
      return idx;
    }

    // ── Canvas sizing (retina, dpr capped at 2) ──
    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = stage!.clientWidth;
      const h = stage!.clientHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawn = -1; // force redraw at new size
    }

    function drawCover(img: HTMLImageElement) {
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      const s = Math.max(cw / img.width, ch / img.height);
      const w = img.width * s;
      const h = img.height * s;
      ctx!.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    let currentIdx = 0;
    let rafPending = false;

    function paint(idx: number) {
      const src = nearestLoaded(idx);
      const img = images[src];
      if (!img || !loaded[src]) return;
      if (src === lastDrawn) return;
      drawCover(img);
      lastDrawn = src;
    }

    function requestRender() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        paint(currentIdx);
      });
    }

    function setProgress(p: number) {
      currentIdx = Math.min(LAST, Math.max(0, Math.round(p * LAST)));
      requestRender();
    }

    sizeCanvas();

    // ── Reduced motion: static poster, no scrub, overlays all shown ──
    if (reduce) {
      const poster = new Image();
      poster.src = POSTER_START;
      poster.onload = () => {
        loaded[0] = true;
        images[0] = poster;
        paint(0);
      };
      // Show only the intro; the moving feature/CTA overlays don't apply here.
      gsap.set(o1.current, { autoAlpha: 1, y: 0, filter: "none" });
      gsap.set([o2.current, o3.current, o4.current].filter(Boolean), {
        autoAlpha: 0,
      });
      const onResize = () => {
        sizeCanvas();
        if (images[0]) drawCover(images[0]);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    // ── Warm the first frames, paint frame 1, then scrub the rest ──
    let cleanup = () => {};
    (async () => {
      await loadFrame(0);
      paint(0);
      preloadAll();

      const scrubVh = isMobile ? SCRUB_VH_MOBILE : SCRUB_VH_DESKTOP;
      const scrollLen = () => window.innerHeight * scrubVh;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => "+=" + scrollLen(),
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
        },
      });

      // Spacer that gives the timeline a normalized 0→1 length.
      tl.to({}, { duration: 1 }, 0);

      // Scroll hint fades out almost immediately.
      if (scrollHintRef.current) {
        tl.to(scrollHintRef.current, { opacity: 0, duration: 0.04 }, 0);
      }

      // ── Overlay choreography (positions are 0→1 of the pinned scroll) ──
      // autoAlpha = opacity + visibility, so hidden panels never catch clicks.
      const enter = { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.05, ease: "power2.out" };
      const exit = { autoAlpha: 0, y: -18, filter: "blur(6px)", duration: 0.05, ease: "power2.in" };

      // Overlay 1 — intro (visible at load → out early)
      gsap.set(o1.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      tl.to(o1.current, exit, 0.12);

      // Overlay 2
      gsap.set(o2.current, { autoAlpha: 0, y: 26, filter: "blur(8px)" });
      tl.to(o2.current, enter, 0.2).to(o2.current, exit, 0.4);

      // Overlay 3
      gsap.set(o3.current, { autoAlpha: 0, y: 26, filter: "blur(8px)" });
      tl.to(o3.current, enter, 0.5).to(o3.current, exit, 0.68);

      // Overlay 4 — final, stays in
      gsap.set(o4.current, { autoAlpha: 0, y: 26, filter: "blur(8px)" });
      tl.to(o4.current, enter, 0.82);

      const onResize = () => {
        sizeCanvas();
        paint(currentIdx);
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    })();

    return () => cleanup();
  }, []);

  return (
    <section
      aria-label="Socially AI in motion"
      className="relative"
      style={{ background: "#121212" }}
    >
      {/* Pinned stage */}
      <div ref={stageRef} className="relative h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ display: "block" }}
        />

        {/* Cinematic vignette + top/bottom scrims for text legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,18,18,0.55) 0%, rgba(18,18,18,0.05) 22%, rgba(18,18,18,0.05) 62%, rgba(18,18,18,0.85) 100%)",
          }}
        />

        {/* ── Overlay 1 — intro (center) ── */}
        <div
          ref={o1}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <div className="pointer-events-auto flex flex-col items-center">
            <span className="font-data mb-5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-md">
              Personal Social Agent
            </span>
            <h1
              className="font-display leading-[0.95] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(44px, 9vw, 132px)", fontWeight: 600 }}
            >
              Social,
              <br />
              <span className="sai-gradient-text">understood.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-white/70 sm:text-lg">
              Every conversation begins here. Scroll to meet the agent behind it.
            </p>
          </div>
        </div>

        {/* ── Overlay 2 — feature panel (lower-left) ── */}
        <div
          ref={o2}
          className="pointer-events-none absolute inset-0 flex items-end justify-start p-6 sm:items-center sm:p-16"
        >
          <div className="glass-panel pointer-events-auto max-w-sm rounded-2xl p-6 sm:p-7">
            <span className="font-data text-[11px] uppercase tracking-[0.2em] text-[var(--sai-violet)]">
              It creates
            </span>
            <h2 className="font-display mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Your voice, on autopilot
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Drafts posts in your tone across every platform — the moment a trend
              breaks, not hours later.
            </p>
          </div>
        </div>

        {/* ── Overlay 3 — feature panel (upper-right) ── */}
        <div
          ref={o3}
          className="pointer-events-none absolute inset-0 flex items-start justify-end p-6 sm:items-center sm:p-16"
        >
          <div className="glass-panel pointer-events-auto max-w-sm rounded-2xl p-6 sm:p-7">
            <span className="font-data text-[11px] uppercase tracking-[0.2em] text-[var(--sai-indigo)]">
              It engages
            </span>
            <h2 className="font-display mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Intelligence behind every interaction
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Replies to the noise, escalates real leads. You only touch what moves
              the business.
            </p>
          </div>
        </div>

        {/* ── Overlay 4 — final CTA (center) ── */}
        <div
          ref={o4}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <div className="pointer-events-auto flex flex-col items-center">
            <span className="font-data mb-5 text-[11px] uppercase tracking-[0.22em] text-white/60">
              It converts
            </span>
            <h2
              className="font-display leading-[1] tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(34px, 6vw, 76px)", fontWeight: 600 }}
            >
              Your AI never sleeps.
            </h2>
            <p className="mt-5 max-w-lg text-base text-white/70 sm:text-lg">
              Attention in. Revenue out. Around the clock.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/signup">
                <button
                  className="group flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #a855f7 60%, #f5c451 130%)",
                    boxShadow: "0 0 40px -6px rgba(99,102,241,0.6)",
                  }}
                >
                  Deploy your agent
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link href="/login">
                <button className="rounded-full border border-white/15 bg-white/[0.05] px-7 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10">
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          ref={scrollHintRef}
          className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 text-center"
        >
          <div className="font-data text-[10px] uppercase tracking-[0.3em] text-white/40">
            Scroll
          </div>
          <div className="mx-auto mt-2 h-8 w-px animate-pulse bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
