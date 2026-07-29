"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays, LineChart, FileText, MessagesSquare, Workflow, Webhook,
  AtSign, Building2, Camera, Check, Plug, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";

type Tool = {
  provider: string; name: string; desc: string; category: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string;
};

const TOOLS: Tool[] = [
  { provider: "google_calendar", name: "Google Calendar", desc: "Sync scheduled posts to your calendar.", category: "Calendar", icon: CalendarDays, color: "#4285F4" },
  { provider: "google_analytics", name: "Google Analytics", desc: "Attribute traffic and conversions.", category: "Analytics", icon: LineChart, color: "#E37400" },
  { provider: "notion", name: "Notion", desc: "Pull content briefs and ideas.", category: "Content", icon: FileText, color: "#ffffff" },
  { provider: "slack", name: "Slack", desc: "Get lead + agent alerts in a channel.", category: "Automation", icon: MessagesSquare, color: "#E01E5A" },
  { provider: "zapier", name: "Zapier", desc: "Connect 6,000+ apps to your workflow.", category: "Automation", icon: Workflow, color: "#FF4F00" },
  { provider: "webhook", name: "Webhooks", desc: "Push events to your own endpoint.", category: "Automation", icon: Webhook, color: "#a855f7" },
  { provider: "x", name: "X (Twitter)", desc: "Publish and read engagement.", category: "Social", icon: AtSign, color: "#1DA1F2" },
  { provider: "linkedin", name: "LinkedIn", desc: "Publish posts and articles.", category: "Social", icon: Building2, color: "#0A66C2" },
  { provider: "instagram", name: "Instagram", desc: "Schedule reels and posts.", category: "Social", icon: Camera, color: "#E1306C" },
];

const CATEGORIES = ["Calendar", "Analytics", "Content", "Automation", "Social"];

export default function IntegrationsPage() {
  const { success, error: toastError } = useToast();
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data } = await supabase.from("integrations").select("provider, status");
        if (data) {
          const map: Record<string, boolean> = {};
          data.forEach((r) => { map[r.provider] = r.status === "connected"; });
          setConnected(map);
        }
      } catch { /* offline */ }
    })();
  }, []);

  const toggle = async (t: Tool) => {
    const next = !connected[t.provider];
    setPending(t.provider);
    setConnected((c) => ({ ...c, [t.provider]: next }));
    if (userId) {
      const supabase = createClient();
      const { error } = await supabase.from("integrations").upsert(
        { user_id: userId, provider: t.provider, status: next ? "connected" : "disconnected" },
        { onConflict: "user_id,provider" }
      );
      if (error) { toastError("Couldn't update integration", error.message); setConnected((c) => ({ ...c, [t.provider]: !next })); }
      else success(next ? `${t.name} connected` : `${t.name} disconnected`);
    } else {
      success(next ? `${t.name} connected` : `${t.name} disconnected`);
    }
    setPending(null);
  };

  const connectedCount = Object.values(connected).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Connect"
        title="Integrations"
        sub="Plug Socially into the tools you already use — calendar, analytics, and automation."
        actions={<Pill tone="indigo">{connectedCount} connected</Pill>}
      />

      {CATEGORIES.map((cat) => {
        const items = TOOLS.filter((t) => t.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="mb-8">
            <p className="font-data mb-3 text-[11px] uppercase tracking-[0.2em] text-white/40">{cat}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => {
                const on = !!connected[t.provider];
                return (
                  <GlassCard key={t.provider} className="flex flex-col p-5">
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${t.color} 16%, transparent)` }}>
                        <t.icon className="h-5 w-5" style={{ color: t.color }} />
                      </span>
                      {on && <Pill tone="green"><Check className="h-3 w-3" /> Connected</Pill>}
                    </div>
                    <h3 className="font-display mt-4 text-[15px] font-semibold text-white">{t.name}</h3>
                    <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-white/50">{t.desc}</p>
                    <button
                      onClick={() => toggle(t)}
                      disabled={pending === t.provider}
                      className="mt-4 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium transition-colors disabled:opacity-60"
                      style={on
                        ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }
                        : { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff" }}
                    >
                      {pending === t.provider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
                      {on ? "Disconnect" : "Connect"}
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
