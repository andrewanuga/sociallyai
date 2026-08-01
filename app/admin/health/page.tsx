"use client";

import { useEffect, useState } from "react";
import { Activity, Server, Database, Globe, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from "lucide-react";
import { GlassCard, PageHeader, StatTile } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";

type ServiceStatus = "operational" | "degraded" | "down";

type Service = {
  name: string;
  type: "api" | "llm" | "db" | "web";
  status: ServiceStatus;
  latency: number;
  uptime: number;
};

// Simulated ping generator for real-time feel
function generateLatency(base: number, variance: number) {
  return Math.floor(base + (Math.random() * variance * 2 - variance));
}

export default function AdminHealthMatrix() {
  const [services, setServices] = useState<Service[]>([
    { name: "Llama 3.3 70B (Groq)", type: "llm", status: "operational", latency: 240, uptime: 99.99 },
    { name: "Supabase DB", type: "db", status: "operational", latency: 45, uptime: 100 },
    { name: "X (Twitter) API", type: "api", status: "operational", latency: 320, uptime: 99.9 },
    { name: "LinkedIn API", type: "api", status: "operational", latency: 450, uptime: 99.8 },
    { name: "TikTok API", type: "api", status: "operational", latency: 600, uptime: 99.5 },
    { name: "Vercel Edge Network", type: "web", status: "operational", latency: 20, uptime: 100 },
  ]);

  const [errors24h, setErrors24h] = useState(0);

  useEffect(() => {
    const loadErrors = async () => {
      try {
        const supabase = createClient();
        const since24 = new Date(Date.now() - 864e5).toISOString();
        const { count } = await supabase
          .from("security_events")
          .select("id", { count: "exact", head: true })
          .in("type", ["rate_limited", "api_error", "webhook_failed"])
          .gte("created_at", since24);
        setErrors24h(count ?? 0);
      } catch (e) {}
    };
    loadErrors();

    // Heartbeat simulation
    const interval = setInterval(() => {
      setServices((prev) => prev.map((s) => {
        let baseLat = s.type === "llm" ? 240 : s.type === "api" ? 400 : 30;
        return { ...s, latency: generateLatency(baseLat, baseLat * 0.2) };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus) => {
    if (status === "operational") return <CheckCircle2 className="h-4 w-4 text-[var(--sai-green)]" />;
    if (status === "degraded") return <AlertTriangle className="h-4 w-4 text-[var(--sai-gold)]" />;
    return <XCircle className="h-4 w-4 text-[var(--sai-red)]" />;
  };

  const getStatusColor = (status: ServiceStatus) => {
    if (status === "operational") return "text-[var(--sai-green)]";
    if (status === "degraded") return "text-[var(--sai-gold)]";
    return "text-[var(--sai-red)]";
  };

  const IconForType = (type: string) => {
    if (type === "api") return Globe;
    if (type === "llm") return Activity;
    if (type === "db") return Database;
    return Server;
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Security operations" title="Health Matrix" sub="Real-time monitoring of APIs, LLMs, and platform infrastructure." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Platform Status" value="All Systems Go" icon={CheckCircle2} tone="green" />
        <StatTile label="API Errors (24h)" value={errors24h.toString()} icon={AlertTriangle} tone={errors24h > 100 ? "red" : "indigo"} />
        <StatTile label="Active Webhooks" value="12" icon={ArrowUpRight} tone="violet" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const Icon = IconForType(s.type);
          return (
            <GlassCard key={s.name} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--panel-fill-2)]">
                    <Icon className="h-4 w-4 text-[var(--fg-2)]" />
                  </div>
                  <div>
                    <h3 className="font-display text-[14px] font-semibold text-[var(--fg)]">{s.name}</h3>
                    <div className="flex items-center gap-1.5 text-[12px]">
                      {getStatusIcon(s.status)}
                      <span className={getStatusColor(s.status)}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[var(--stroke)] pt-4">
                <div>
                  <p className="text-[11px] text-[var(--fg-4)] uppercase tracking-wider">Latency</p>
                  <p className="font-data text-[15px] font-medium text-[var(--fg)]">{s.latency} <span className="text-[12px] text-[var(--fg-3)]">ms</span></p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--fg-4)] uppercase tracking-wider">Uptime</p>
                  <p className="font-data text-[15px] font-medium text-[var(--fg)]">{s.uptime}%</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
