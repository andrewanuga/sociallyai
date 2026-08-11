"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Users, BarChart3, TrendingUp, DollarSign, Plug, ExternalLink } from "lucide-react";
import { GlassCard, PageHeader, StatTile } from "@/components/dashboard/ui";
import { fmtNaira } from "@/lib/dashboard/helpers";
import { useWorkspace } from "@/components/dashboard/WorkspaceProvider";

interface ClientData {
  id: string;
  name: string;
  role: string;
  campaignsActive: number;
  totalSpend: number;
  avgRoas: number;
}

export function AgencyClient({ clients }: { clients: ClientData[] }) {
  const { setActiveWorkspace } = useWorkspace();

  const totals = useMemo(() => {
    return {
      spend: clients.reduce((sum, c) => sum + c.totalSpend, 0),
      roas: clients.length ? clients.reduce((sum, c) => sum + c.avgRoas, 0) / clients.length : 0,
      active: clients.reduce((sum, c) => sum + c.campaignsActive, 0),
    };
  }, [clients]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Marketer Space"
        title="Agency Hub"
        sub="The master control room. Monitor client spend, active campaigns, and jump directly into their workspaces."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total Clients" value={String(clients.length)} icon={Users} tone="indigo" />
        <StatTile label="Managed Spend" value={fmtNaira(totals.spend)} icon={DollarSign} tone="gold" />
        <StatTile label="Avg Portfolio ROAS" value={`${totals.roas.toFixed(1)}×`} icon={TrendingUp} tone="green" />
        <StatTile label="Active Campaigns" value={String(totals.active)} icon={BarChart3} tone="violet" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[16px] font-semibold text-[var(--fg)]">Client Workspaces</h2>
          <button className="text-[13px] font-semibold text-[var(--sai-indigo)] hover:underline">
            + Invite Client
          </button>
        </div>

        {clients.length === 0 ? (
          <GlassCard className="relative flex flex-col items-center justify-center overflow-hidden py-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--sai-indigo)]/5 to-[var(--sai-violet)]/5" />
            <Plug className="relative z-10 mb-4 h-12 w-12 text-[var(--fg-4)] transition-transform hover:scale-110 hover:text-[var(--sai-indigo)]" />
            <p className="relative z-10 font-display text-[18px] font-semibold text-[var(--fg)]">No clients connected yet</p>
            <p className="relative z-10 mt-2 max-w-sm text-[14px] text-[var(--fg-3)]">
              Invite your first client to start managing their campaigns and track their ROAS from a unified dashboard.
            </p>
            <button className="relative z-10 mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              + Invite First Client
            </button>
          </GlassCard>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <GlassCard key={client.id} className="group relative flex flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[var(--sai-indigo)]/20 hover:border-[var(--sai-indigo)]/30">
                {/* Subtle animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--sai-indigo)]/0 via-[var(--sai-violet)]/0 to-[var(--sai-gold)]/0 opacity-0 transition-opacity duration-500 group-hover:from-[var(--sai-indigo)]/5 group-hover:via-[var(--sai-violet)]/5 group-hover:to-[var(--sai-gold)]/5 group-hover:opacity-100" />
                
                <div className="relative z-10 mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-[17px] font-semibold text-[var(--fg)] tracking-tight">{client.name}</h3>
                    <span className="mt-1.5 inline-block rounded-full bg-[var(--panel-fill-2)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--fg-3)] ring-1 ring-inset ring-[var(--stroke)]">
                      {client.role}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveWorkspace(client.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--panel-fill-2)] text-[var(--fg-3)] ring-1 ring-inset ring-[var(--stroke)] transition-all hover:bg-[var(--sai-indigo)] hover:text-white hover:ring-[var(--sai-indigo)]"
                    title="Switch to Client Workspace"
                  >
                    <ExternalLink className="h-[18px] w-[18px]" />
                  </button>
                </div>

                <div className="relative z-10 mt-auto grid grid-cols-3 gap-3 border-t border-[var(--stroke)] pt-5">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">Active</p>
                    <div className="mt-1 flex items-baseline gap-1">
                      <p className="font-data text-[18px] font-semibold text-[var(--fg)]">{client.campaignsActive}</p>
                      <span className="text-[11px] font-medium text-[var(--fg-4)]">camp.</span>
                    </div>
                  </div>
                  <div className="flex flex-col border-l border-[var(--stroke)] pl-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">Spend</p>
                    <p className="font-data mt-1 text-[16px] font-semibold text-[var(--fg)]">{fmtNaira(client.totalSpend)}</p>
                  </div>
                  <div className="flex flex-col border-l border-[var(--stroke)] pl-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">ROAS</p>
                    <p className="font-data mt-1 text-[16px] font-semibold text-[var(--sai-green)]">{client.avgRoas.toFixed(1)}×</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
