"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base — pure black dark, white light */}
      <div className="absolute inset-0 bg-white dark:bg-black" />

      {/* Primary red blob — top left */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.18] blur-[130px] animate-float"
        style={{
          background:
            "radial-gradient(circle, #dc2626 0%, #7f1d1d 55%, transparent 75%)",
          animationDelay: "0s",
        }}
      />

      {/* Deep crimson blob — right */}
      <div
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-[110px] animate-float"
        style={{
          background:
            "radial-gradient(circle, #ef4444 0%, #991b1b 55%, transparent 75%)",
          animationDelay: "2s",
        }}
      />

      {/* Rose blob — bottom */}
      <div
        className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.09] blur-[100px] animate-float"
        style={{
          background:
            "radial-gradient(circle, #f43f5e 0%, #be123c 55%, transparent 75%)",
          animationDelay: "4s",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial fade — black centre vignette */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, transparent 0%, #000 100%)",
        }}
      />
    </div>
  );
}

export function SpotlightEffect() {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);
    };

    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={divRef}
      className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        background:
          "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(220,38,38,0.07), transparent 40%)",
      }}
    />
  );
}

type OrbConfig = {
  size: number;
  top: string;
  left?: string;
  right?: string;
  delay: string;
  duration: string;
};

export function FloatingOrbs() {
  const orbs: OrbConfig[] = [
    { size: 8, top: "15%", left: "10%",  delay: "0s",   duration: "4s"   },
    { size: 5, top: "25%", right: "15%", delay: "1s",   duration: "5s"   },
    { size: 6, top: "60%", left: "20%",  delay: "2s",   duration: "6s"   },
    { size: 4, top: "70%", right: "25%", delay: "0.5s", duration: "4.5s" },
    { size: 3, top: "40%", left: "50%",  delay: "1.5s", duration: "3.5s" },
    { size: 7, top: "80%", left: "5%",   delay: "3s",   duration: "5.5s" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            background: i % 2 === 0 ? "#ef4444" : "#f87171",
            boxShadow: `0 0 ${orb.size * 3}px ${i % 2 === 0 ? "#ef4444" : "#f87171"}`,
            animationDelay: orb.delay,
            animationDuration: orb.duration,
            opacity: 0.55,
          }}
        />
      ))}
    </div>
  );
}
