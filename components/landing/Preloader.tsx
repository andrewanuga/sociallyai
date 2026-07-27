"use client";

import { useEffect, useRef, useState } from "react";
import { FRAME_COUNT, framePath, WARM_FRAMES } from "@/lib/frames";

/**
 * Full-screen #121212 preloader. The "Socially AI" wordmark has a bright lead
 * sweeping through it like water flow (CSS .sai-flow-text). Warms the first
 * frames + fonts so the hero paints instantly, then fades away.
 */
export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();
    const MIN_MS = 1500; // let the sweep breathe at least once

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    async function warm() {
      const total = Math.min(WARM_FRAMES, FRAME_COUNT);
      let loaded = 0;

      // Fonts first (so the wordmark is in General Sans immediately)
      try {
        // @ts-expect-error - fonts API is fine at runtime
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {}

      const bump = () => {
        loaded++;
        if (!cancelled) setProgress(Math.round((loaded / total) * 100));
      };

      await Promise.all(
        Array.from({ length: total }, (_, k) => {
          const img = new Image();
          img.src = framePath(k + 1);
          const settle = () =>
            (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(bump);
          return img.complete ? settle() : new Promise<void>((res) => {
            img.onload = () => settle().then(res);
            img.onerror = () => {
              bump();
              res();
            };
          });
        })
      );

      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_MS - elapsed);
      window.setTimeout(() => !cancelled && setDone(true), reduce ? 0 : wait);
    }

    warm();
    // Safety valve — never trap the user behind the loader.
    const failsafe = window.setTimeout(() => !cancelled && setDone(true), 6000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    if (!done) return;
    document.documentElement.classList.add("sai-loaded");
    const t = window.setTimeout(() => setHidden(true), 700);
    return () => window.clearTimeout(t);
  }, [done]);

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden={done}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center transition-opacity duration-700"
      style={{
        background: "#121212",
        opacity: done ? 0 : 1,
        pointerEvents: done ? "none" : "auto",
      }}
    >
      {/* ambient bloom behind the mark */}
      <div
        className="pointer-events-none absolute h-[340px] w-[340px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo monogram */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Socially AI"
          width={78}
          height={67}
          className="h-[64px] w-auto animate-pulse-glow"
          style={{ filter: "drop-shadow(0 0 18px rgba(99,102,241,0.45))" }}
        />

        {/* Wordmark with water-flow light sweep */}
        <div
          className="font-display sai-flow-text select-none text-center"
          style={{
            fontSize: "clamp(30px, 6vw, 52px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
          }}
        >
          Socially AI
        </div>

        {/* thin progress track */}
        <div className="mt-1 h-px w-[190px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #6366f1, #a855f7, #f5c451)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
