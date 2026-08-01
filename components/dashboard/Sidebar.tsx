"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, MessagesSquare, ListTodo, CalendarRange, Inbox,
  BarChart3, TrendingUp, Bot, Ghost, Plug, CreditCard, Settings,
  LifeBuoy, LogOut, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Item = { href: string; label: string; icon: typeof LayoutDashboard; badge?: number; exact?: boolean };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/create", label: "Create", icon: MessagesSquare },
      { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
      { href: "/dashboard/calendar", label: "Scheduler", icon: CalendarRange },
      { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/trends", label: "Trends", icon: TrendingUp },
    ],
  },
  {
    title: "Automation",
    items: [
      { href: "/dashboard/bots", label: "Bots", icon: Bot },
      { href: "/dashboard/ghost-mode", label: "Ghost Mode", icon: Ghost },
    ],
  },
  {
    title: "Connect",
    items: [{ href: "/dashboard/integrations", label: "Integrations", icon: Plug }],
  },
];

const BOTTOM: Item[] = [
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [inboxUnread, setInboxUnread] = useState(0);

  // Live unread inbox count for the sidebar badge.
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from("social_inbox")
          .select("id", { count: "exact", head: true })
          .eq("is_read", false);
        setInboxUnread(count ?? 0);
      } catch { /* offline */ }
    })();
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== "/dashboard";

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const Row = ({ item }: { item: Item }) => {
    const active = isActive(item.href, item.exact);
    const badge = item.href === "/dashboard/inbox" ? (inboxUnread || undefined) : item.badge;
    return (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13.5px] font-medium transition-colors duration-150",
          active ? "text-[var(--fg)]" : "text-[var(--fg-2)] hover:text-[var(--fg)]",
          collapsed && "justify-center px-2"
        )}
        style={active ? { background: "rgba(99,102,241,0.14)" } : undefined}
      >
        {/* active accent bar */}
        {active && (
          <span
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
            style={{ background: "linear-gradient(180deg,#6366f1,#a855f7)" }}
          />
        )}
        <item.icon
          className="h-[18px] w-[18px] flex-shrink-0"
          style={active ? { color: "var(--sai-indigo)" } : undefined}
        />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        {!collapsed && badge && (
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10.5px] font-semibold text-[var(--fg)]"
            style={{ background: "rgba(99,102,241,0.3)" }}
          >
            {badge}
          </span>
        )}
        {collapsed && (
          <span className="glass-panel pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg)] opacity-0 transition-opacity group-hover:opacity-100">
            {item.label}
            {badge ? <span className="ml-1 text-[var(--sai-indigo)]">· {badge}</span> : null}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-[var(--stroke)] transition-[width] duration-300",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
      style={{ background: "var(--app-surface)", backdropFilter: "blur(20px)" }}
    >
      {/* Brand */}
      <div className={cn("flex h-16 flex-shrink-0 items-center border-b border-[var(--stroke)] px-4", collapsed ? "justify-center" : "gap-2.5")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={26} height={23} className="h-[24px] w-auto" style={{ filter: "drop-shadow(0 0 10px rgba(99,102,241,0.4))" }} />
        {!collapsed && (
          <span className="font-display text-[16px] font-semibold text-[var(--fg)]">
            Socially<span className="text-[var(--sai-indigo)]"> AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {SECTIONS.map((sec) => (
          <div key={sec.title} className="mb-4">
            {!collapsed && (
              <p className="font-data mb-1.5 px-2.5 text-[10px] uppercase tracking-[0.2em] text-[var(--fg-4)]">
                {sec.title}
              </p>
            )}
            {collapsed && <div className="mx-auto mb-2 h-px w-6 bg-[var(--stroke)]" />}
            <div className="space-y-0.5">
              {sec.items.map((item) => <Row key={item.href} item={item} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-0.5 border-t border-[var(--stroke)] px-2.5 py-3">
        {BOTTOM.map((item) => <Row key={item.href} item={item} />)}
        <button
          onClick={logout}
          className={cn(
            "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13.5px] font-medium text-[var(--fg-2)] transition-colors hover:text-[var(--sai-red)]",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
          {collapsed && (
            <span className="glass-panel pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg)] opacity-0 transition-opacity group-hover:opacity-100">
              Sign out
            </span>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="Toggle sidebar"
        className="glass-panel absolute -right-3 top-[70px] z-50 flex h-6 w-6 items-center justify-center rounded-full text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
      >
        {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
      </button>
    </aside>
  );
}
