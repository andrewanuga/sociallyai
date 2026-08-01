"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ShieldAlert, ArrowLeft, LogOut, Megaphone, ToggleLeft, Activity, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/admin", label: "SOC Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/security", label: "Security", icon: ShieldAlert },
  { href: "/admin/features", label: "Feature Flags", icon: ToggleLeft },
  { href: "/admin/broadcasts", label: "Broadcasts", icon: Megaphone },
  { href: "/admin/health", label: "Health Matrix", icon: Activity },
  { href: "/admin/firehose", label: "Agent Firehose", icon: Flame },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/"); router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[240px] flex-col border-r border-[var(--stroke)]" style={{ background: "var(--app-surface)", backdropFilter: "blur(20px)" }}>
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--stroke)] px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={24} height={21} className="h-[22px] w-auto" />
        <div>
          <span className="font-display text-[15px] font-semibold text-[var(--fg)]">Socially</span>
          <span className="ml-1.5 rounded-md px-1.5 py-0.5 font-data text-[9px] uppercase tracking-wider" style={{ color: "var(--sai-red)", background: "color-mix(in srgb, var(--sai-red) 14%, transparent)" }}>Admin</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {ITEMS.map((it) => {
          const on = active(it.href, it.exact);
          return (
            <Link key={it.href} href={it.href} className={cn("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors", on ? "text-[var(--fg)]" : "text-[var(--fg-2)] hover:text-[var(--fg)]")} style={on ? { background: "rgba(99,102,241,0.14)" } : undefined}>
              {on && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full" style={{ background: "linear-gradient(180deg,#6366f1,#a855f7)" }} />}
              <it.icon className="h-[18px] w-[18px]" style={on ? { color: "var(--sai-indigo)" } : undefined} />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[var(--stroke)] p-3">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-[var(--fg-2)] hover:text-[var(--fg)]"><ArrowLeft className="h-[18px] w-[18px]" /> Back to app</Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-[var(--fg-2)] transition-colors hover:text-[var(--sai-red)]"><LogOut className="h-[18px] w-[18px]" /> Sign out</button>
      </div>
    </aside>
  );
}
