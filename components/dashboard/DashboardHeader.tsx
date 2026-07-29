"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Search, Menu, Plus, PanelLeft } from "lucide-react";

export function DashboardHeader({
  onMobileMenuToggle,
  onToggleSidebar,
}: {
  title?: string;
  onMobileMenuToggle?: () => void;
  onToggleSidebar?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] px-4 sm:px-6"
      style={{ background: "rgba(18,18,22,0.72)", backdropFilter: "blur(18px)" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/[0.06] md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Desktop sidebar collapse */}
        <button
          onClick={onToggleSidebar}
          aria-label="Collapse sidebar"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white md:flex"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            placeholder="Search posts, tasks, trends…"
            className="h-9 w-64 rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white placeholder:text-white/35 focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/create"
          className="hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03] sm:flex"
          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 24px -10px rgba(99,102,241,0.8)" }}
        >
          <Plus className="h-4 w-4" /> Create
        </Link>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: "var(--sai-red)" }} />
        </button>

        <div
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[12px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          suppressHydrationWarning
        >
          {mounted ? "U" : ""}
        </div>
      </div>
    </header>
  );
}
