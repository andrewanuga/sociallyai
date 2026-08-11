"use client";

import Link from "next/link";
import { Search, Menu, Plus, PanelLeft, Briefcase, Zap, AlertTriangle } from "lucide-react";
import { NotificationsMenu, ProfileMenu, WorkspaceMenu } from "./HeaderMenus";
import { useWorkspace } from "./WorkspaceProvider";
import { useToast } from "@/components/ui/toast";

export function DashboardHeader({
  onMobileMenuToggle,
  onToggleSidebar,
}: {
  title?: string;
  onMobileMenuToggle?: () => void;
  onToggleSidebar?: () => void;
}) {
  const { persona, plan, setPersona } = useWorkspace();
  const { error } = useToast();

  const handleModeSwitch = async (mode: string) => {
    if (mode === "marketer" && plan !== "advanced" && plan !== "team") {
      error(
        "Upgrade Required",
        "Marketer Mode (Agency Hub, Campaigns, CRM) is strictly reserved for the Team and Advanced plan."
      );
      return;
    }
    await setPersona(mode);
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--stroke)] px-4 sm:px-6"
      style={{ background: "var(--app-header)", backdropFilter: "blur(18px)" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-2)] hover:bg-[var(--hover)] md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Desktop sidebar collapse */}
        <button
          onClick={onToggleSidebar}
          aria-label="Collapse sidebar"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] md:flex"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>

        {/* Mode Switcher */}
        <div className="hidden items-center rounded-full bg-[var(--panel-fill-2)] p-1 sm:flex">
          <button
            onClick={() => handleModeSwitch("creator")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${
              persona !== "marketer"
                ? "bg-[var(--panel-fill)] text-[var(--fg)] shadow-sm"
                : "text-[var(--fg-3)] hover:text-[var(--fg)]"
            }`}
          >
            <Zap className="h-3.5 w-3.5" /> Creator
          </button>
          <button
            onClick={() => handleModeSwitch("marketer")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${
              persona === "marketer"
                ? "bg-[var(--sai-indigo)] text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                : "text-[var(--fg-3)] hover:text-[var(--fg)]"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" /> Marketer
          </button>
        </div>

        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
          <input
            placeholder="Search posts, tasks, trends…"
            className="h-9 w-64 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] pl-9 pr-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/create"
          className="hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-[var(--fg)] transition-transform hover:scale-[1.03] sm:flex"
          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 24px -10px rgba(99,102,241,0.8)" }}
        >
          <Plus className="h-4 w-4" /> Create
        </Link>

        <WorkspaceMenu />
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}
