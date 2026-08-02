"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, Settings, CreditCard, LifeBuoy, LogOut, UserRound, Users, ChevronDown, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/dashboard/helpers";
import { useWorkspace } from "./WorkspaceProvider";

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

type Notif = {
  id: string; author: string | null; body: string; category: string;
  received_at: string;
  table: "social_inbox" | "user_notifications";
};

const catTone: Record<string, string> = {
  lead: "var(--sai-gold)", complaint: "var(--sai-red)", question: "var(--sai-indigo)",
  mention: "var(--sai-violet)", fluff: "var(--fg-3)",
};

/* ── Notifications ─────────────────────────────────────────────── */
export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const load = async () => {
    try {
      const supabase = createClient();
      const [inboxRes, notifRes] = await Promise.all([
        supabase.from("social_inbox").select("id, author_name, body, category, received_at, is_read").eq("is_read", false).order("received_at", { ascending: false }).limit(8),
        supabase.from("user_notifications").select("id, title, body, type, created_at, is_read").eq("is_read", false).order("created_at", { ascending: false }).limit(8)
      ]);
      
      const inboxList = (inboxRes.data ?? []).map((m) => ({ id: m.id, author: m.author_name, body: m.body, category: m.category, received_at: m.received_at, table: "social_inbox" as const }));
      const notifList = (notifRes.data ?? []).map((m) => ({ id: m.id, author: m.title || "System", body: m.body, category: m.type, received_at: m.created_at, table: "user_notifications" as const }));
      
      const merged = [...inboxList, ...notifList].sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()).slice(0, 8);
      setItems(merged);

      const [inboxCount, notifCount] = await Promise.all([
        supabase.from("social_inbox").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("user_notifications").select("id", { count: "exact", head: true }).eq("is_read", false)
      ]);
      setCount((inboxCount.count ?? 0) + (notifCount.count ?? 0));
    } catch { /* offline */ }
    setLoaded(true);
  };
  useEffect(() => {
    load();
    // Real-time: refresh whenever the user's inbox changes.
    const supabase = createClient();
    const channel = supabase
      .channel("sai-inbox-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_inbox" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_notifications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAll = async () => {
    setItems([]); setCount(0);
    try { 
      const supabase = createClient(); 
      await Promise.all([
        supabase.from("social_inbox").update({ is_read: true }).eq("is_read", false),
        supabase.from("user_notifications").update({ is_read: true }).eq("is_read", false)
      ]);
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
      >
        <Bell className="h-[18px] w-[18px]" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white" style={{ background: "var(--sai-red)" }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-panel absolute right-0 top-11 z-50 w-[340px] overflow-hidden rounded-2xl" style={{ background: "var(--app-surface)" }}>
          <div className="flex items-center justify-between border-b border-[var(--stroke)] px-4 py-3">
            <p className="text-[14px] font-semibold text-[var(--fg)]">Notifications</p>
            {items.length > 0 && (
              <button onClick={markAll} className="flex items-center gap-1 text-[12px] text-[var(--sai-indigo)] hover:underline"><Check className="h-3.5 w-3.5" /> Mark all read</button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {!loaded ? (
              <p className="px-4 py-8 text-center text-[13px] text-[var(--fg-4)]">Loading…</p>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 h-7 w-7 text-[var(--fg-4)]" />
                <p className="text-[13px] text-[var(--fg-3)]">You&apos;re all caught up.</p>
                <p className="mt-0.5 text-[12px] text-[var(--fg-4)]">New messages appear here.</p>
              </div>
            ) : (
              items.map((n) => (
                <Link key={n.id} href="/dashboard/inbox" onClick={() => setOpen(false)} className="flex gap-3 border-b border-[var(--stroke)] px-4 py-3 transition-colors last:border-0 hover:bg-[var(--hover)]">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                    {(n.author ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-[var(--fg)]">{n.author ?? "Unknown"}</span>
                      <span className="ml-auto text-[11px] text-[var(--fg-4)]">{timeAgo(n.received_at)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12.5px] text-[var(--fg-3)]">{n.body}</p>
                    <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider" style={{ color: catTone[n.category] ?? "var(--fg-3)", background: `color-mix(in srgb, ${catTone[n.category] ?? "var(--fg-3)"} 13%, transparent)` }}>{n.category}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link href="/dashboard/inbox" onClick={() => setOpen(false)} className="block border-t border-[var(--stroke)] px-4 py-2.5 text-center text-[12.5px] font-medium text-[var(--sai-indigo)] hover:bg-[var(--hover)]">
            Open inbox
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Workspace menu ──────────────────────────────────────────────── */
export function WorkspaceMenu() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  if (!activeWorkspace || workspaces.length <= 1) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 text-[13px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
      >
        <Users className="h-[15px] w-[15px] text-[var(--sai-indigo)]" />
        <span className="max-w-[100px] truncate sm:max-w-[140px]">{activeWorkspace.name}</span>
        <ChevronDown className="h-[14px] w-[14px] opacity-60" />
      </button>

      {open && (
        <div className="glass-panel absolute right-0 top-11 z-50 w-[240px] overflow-hidden rounded-2xl" style={{ background: "var(--app-surface)" }}>
          <div className="border-b border-[var(--stroke)] px-4 py-2.5">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">Switch Workspace</p>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1.5">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setActiveWorkspace(w.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                  activeWorkspace.id === w.id ? "bg-[var(--hover)] text-[var(--fg)]" : "text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                }`}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">{w.name}</span>
                  <span className="text-[11px] text-[var(--fg-4)] capitalize">{w.role}</span>
                </div>
                {activeWorkspace.id === w.id && <CheckCircle2 className="h-4 w-4 text-[var(--sai-indigo)]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Profile menu ──────────────────────────────────────────────── */
type Me = { name: string; email: string; username: string | null; plan: string; avatar: string | null };

export function ProfileMenu() {
  const router = useRouter();
  const { success } = useToast();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const ref = useClickOutside(() => setOpen(false));

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: p } = await supabase.from("profiles").select("full_name, username, plan, avatar_url").eq("id", user.id).single();
        setMe({
          name: p?.full_name || user.email?.split("@")[0] || "You",
          email: user.email || "",
          username: p?.username ?? null,
          plan: p?.plan || "free",
          avatar: p?.avatar_url ?? null,
        });
      } catch { /* offline */ }
    })();
  }, []);

  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  const signOut = async () => {
    try { const supabase = createClient(); await supabase.auth.signOut(); } catch {}
    success("Signed out");
    router.push("/"); router.refresh();
  };

  const menu = [
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label="Account" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-white transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }} suppressHydrationWarning>
        {me?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          me ? initials(me.name) : ""
        )}
      </button>

      {open && (
        <div className="glass-panel absolute right-0 top-11 z-50 w-[248px] overflow-hidden rounded-2xl" style={{ background: "var(--app-surface)" }}>
          <div className="flex items-center gap-3 border-b border-[var(--stroke)] p-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-[13px] font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              {me?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.avatar} alt="" className="h-full w-full object-cover" />
              ) : me ? initials(me.name) : <UserRound className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[var(--fg)]">{me?.name ?? "…"}</p>
              <p className="truncate text-[12px] text-[var(--fg-4)]">{me?.email}</p>
            </div>
          </div>
          {me && (
            <div className="border-b border-[var(--stroke)] px-4 py-2">
              <span className="font-data inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--sai-violet)", background: "color-mix(in srgb, var(--sai-violet) 13%, transparent)" }}>{me.plan} plan</span>
            </div>
          )}
          <div className="p-1.5">
            {menu.map((m) => (
              <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]">
                <m.icon className="h-[17px] w-[17px]" /> {m.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-[var(--stroke)] p-1.5">
            <button onClick={signOut} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-[var(--fg-2)] transition-colors hover:bg-[var(--sai-red)]/10 hover:text-[var(--sai-red)]">
              <LogOut className="h-[17px] w-[17px]" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
