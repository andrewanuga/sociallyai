"use client";

import { useEffect, useRef } from "react";

const EASE = "power3.out"; // ≈ expo.out feel without over-shoot

/**
 * Scroll-triggered reveal for a container's `[data-reveal]` children.
 * Gentle fade + translate + blur, staggered — no bounce. Honours
 * prefers-reduced-motion (elements simply appear).
 *
 * GSAP is imported dynamically inside the effect so it never loads during SSR
 * (the ScrollTrigger module touches browser globals at import time).
 */
export function useGsapReveal<T extends HTMLElement = HTMLElement>(opts?: {
  y?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    // Fail-safe: never leave content hidden if GSAP is slow/unavailable.
    const revealNow = () =>
      targets.forEach((n) => {
        n.style.opacity = "1";
        n.style.filter = "none";
        n.style.transform = "none";
      });

    (async () => {
      let gsap: typeof import("gsap").default;
      let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
      try {
        gsap = (await import("gsap")).default;
        ScrollTrigger = (await import("gsap/ScrollTrigger")).ScrollTrigger;
      } catch {
        revealNow();
        return;
      }
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0, filter: "none" });
        return;
      }

      // Group elements by their reveal direction (data-reveal="up|left|right").
      // Default is a gentle slide-up; "left"/"right" slide horizontally in.
      const groups: Record<string, HTMLElement[]> = { up: [], left: [], right: [] };
      targets.forEach((el) => {
        const dir = (el.dataset.reveal || "up").toLowerCase();
        (groups[dir] ?? groups.up).push(el);
      });

      const fromFor = (dir: string) => {
        if (dir === "left") return { opacity: 0, x: -56, y: 0, filter: "blur(8px)" };
        if (dir === "right") return { opacity: 0, x: 56, y: 0, filter: "blur(8px)" };
        return { opacity: 0, x: 0, y: opts?.y ?? 28, filter: "blur(8px)" };
      };

      ctx = gsap.context(() => {
        Object.entries(groups).forEach(([dir, els]) => {
          if (!els.length) return;
          gsap.set(els, fromFor(dir));
          gsap.to(els, {
            opacity: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            duration: 0.95,
            ease: EASE,
            stagger: opts?.stagger ?? 0.12,
            scrollTrigger: {
              trigger: el,
              start: opts?.start ?? "top 80%",
              toggleActions: "play none none none",
            },
          });
        });
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [opts?.y, opts?.stagger, opts?.start]);

  return ref;
}
