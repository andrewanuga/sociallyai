"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EASE = "power3.out"; // ≈ expo.out feel without over-shoot

/**
 * Scroll-triggered reveal for a container's `[data-reveal]` children.
 * Gentle fade + translate + blur, staggered — no bounce. Honours
 * prefers-reduced-motion (elements simply appear).
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

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length) return;

    if (reduce) {
      gsap.set(targets, { opacity: 1, y: 0, filter: "none" });
      return;
    }

    const ctx = gsap.context(() => {
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

    return () => ctx.revert();
  }, [opts?.y, opts?.stagger, opts?.start]);

  return ref;
}
