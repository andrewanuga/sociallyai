"use client";

import { useEffect, useState } from "react";
import { X, Megaphone, AlertTriangle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Broadcast = { id: string; message: string; type: "info" | "warning" | "critical" };

export function GlobalBanner() {
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load hidden broadcasts from local storage
    try {
      const stored = localStorage.getItem("sai-hidden-broadcasts");
      if (stored) setHidden(new Set(JSON.parse(stored)));
    } catch {}

    const load = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("system_broadcasts")
          .select("id, message, type")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (data) setBroadcast(data as Broadcast);
      } catch (e) {}
    };
    
    load();
    
    // Check every 5 minutes for new broadcasts without refreshing page
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!broadcast || hidden.has(broadcast.id)) return null;

  const style = {
    critical: { bg: "var(--sai-red)", icon: AlertTriangle, color: "white" },
    warning: { bg: "var(--sai-gold)", icon: AlertTriangle, color: "black" },
    info: { bg: "var(--sai-indigo)", icon: Info, color: "white" },
  }[broadcast.type] || { bg: "var(--sai-indigo)", icon: Megaphone, color: "white" };

  const Icon = style.icon;

  const dismiss = () => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.add(broadcast.id);
      try { localStorage.setItem("sai-hidden-broadcasts", JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  return (
    <div className="relative z-50 flex items-center justify-between px-4 py-2.5 text-[13.5px] font-medium transition-all" style={{ background: style.bg, color: style.color }}>
      <div className="flex flex-1 items-center justify-center gap-2 text-center">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{broadcast.message}</span>
      </div>
      <button onClick={dismiss} className="ml-4 flex-shrink-0 rounded-full p-1 opacity-70 hover:bg-black/10 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
