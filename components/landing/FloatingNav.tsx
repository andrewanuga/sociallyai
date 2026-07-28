"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#stories", label: "Stories" },
];

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[90] flex justify-center px-4 pt-4">
      <nav
        className="glass-pill flex items-center gap-1 rounded-full pl-4 pr-1.5 py-1.5 transition-all duration-500"
        style={{
          maxWidth: 860,
          width: "100%",
          backdropFilter: scrolled
            ? "blur(22px) saturate(1.6)"
            : "blur(14px) saturate(1.4)",
          background: scrolled
            ? "rgba(18,18,22,0.72)"
            : "rgba(18,18,22,0.42)",
        }}
      >
        {/* Brand segment */}
        <Link href="/" className="flex items-center gap-2 pr-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={22} height={19} className="h-[20px] w-auto" />
          <span className="font-display text-[15px] font-semibold tracking-tight text-white">
            Socially<span className="text-[var(--sai-indigo)]"> AI</span>
          </span>
        </Link>

        <div className="sai-sep mx-2 hidden h-6 md:block" />

        {/* Links segment */}
        <div className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-[13.5px] text-white/70 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="sai-sep mx-1 hidden h-6 md:block" />

          {/* Actions segment */}
          <Link
            href="/login"
            className="hidden rounded-full px-3.5 py-1.5 text-[13.5px] text-white/70 transition-colors hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full px-4 py-1.5 text-[13.5px] font-medium text-white transition-transform duration-200 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              boxShadow: "0 0 22px -6px rgba(99,102,241,0.7)",
            }}
          >
            Get started
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/[0.07] md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div
          className="glass-panel absolute left-4 right-4 top-[72px] rounded-2xl p-2 md:hidden"
          style={{ background: "rgba(18,18,22,0.9)" }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-[15px] text-white/80 transition-colors hover:bg-white/[0.06]"
            >
              {l.label}
            </a>
          ))}
          <div className="my-1 h-px bg-white/10" />
          <a
            href="/login"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-4 py-3 text-[15px] text-white/80 hover:bg-white/[0.06]"
          >
            Sign in
          </a>
        </div>
      )}
    </header>
  );
}
