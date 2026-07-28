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

      ctx = gsap.context(() => {
        gsap.set(targets, { opacity: 0, y: opts?.y ?? 26, filter: "blur(8px)" });
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: EASE,
          stagger: opts?.stagger ?? 0.09,
          scrollTrigger: {
            trigger: el,
            start: opts?.start ?? "top 78%",
            toggleActions: "play none none none",
          },
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
