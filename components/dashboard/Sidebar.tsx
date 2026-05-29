"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PenSquare, Calendar, MessageSquare,
  Ghost, TrendingUp, BarChart3, Settings, Zap,
  ChevronLeft, ChevronRight, LogOut, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",             label: "Overview",    icon: LayoutDashboard, exact: true },
  { href: "/dashboard/compose",     label: "Compose",     icon: PenSquare                   },
  { href: "/dashboard/calendar",    label: "Calendar",    icon: Calendar                    },
  { href: "/dashboard/inbox",       label: "Inbox",       icon: MessageSquare, badge: 4     },
  { href: "/dashboard/ghost-mode",  label: "Ghost Mode",  icon: Ghost                       },
  { href: "/dashboard/trends",      label: "Trends",      icon: TrendingUp                  },
  { href: "/dashboard/analytics",   label: "Analytics",   icon: BarChart3                   },
];

const BOTTOM_ITEMS = [
  { href: "/dashboard/billing",  label: "Billing",  icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings   },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== "/dashboard";
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-border px-4 flex-shrink-0",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg">
            <span className="gradient-text">Socially</span>
            <span className="text-foreground">AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                  active
                    ? "bg-red-500/10 text-red-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon
                  className={cn("w-5 h-5 flex-shrink-0", active && "text-red-400")}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip on collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-popover border border-border text-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 text-red-400">({item.badge})</span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="py-4 px-2 border-t border-border space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all group relative",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-popover border border-border text-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                {item.label}
              </div>
            )}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group relative",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-popover border border-border text-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
              Sign out
            </div>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-accent transition-colors z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
