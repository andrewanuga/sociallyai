"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FloatingAiAssistant } from "@/components/ui/glowing-ai-chat-assistant";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist collapsed preference.
  useEffect(() => {
    const saved = localStorage.getItem("sai-sidebar-collapsed");
    if (saved) setCollapsed(saved === "1");
  }, []);
  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem("sai-sidebar-collapsed", c ? "0" : "1");
      return !c;
    });

  return (
    <div className="sai-app min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Main */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "md:pl-[68px]" : "md:pl-[248px]"
        )}
      >
        <DashboardHeader
          onMobileMenuToggle={() => setMobileOpen((v) => !v)}
          onToggleSidebar={toggle}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <FloatingAiAssistant />
    </div>
  );
}
