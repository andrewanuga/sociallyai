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
          <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
            <Plug className="mb-3 h-10 w-10 text-[var(--fg-4)]" />
            <p className="font-medium text-[var(--fg-2)]">No clients connected yet.</p>
            <p className="mt-1 text-[13px] text-[var(--fg-4)]">Invite your first client to start managing their campaigns.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <GlassCard key={client.id} className="group relative flex flex-col p-5 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--sai-indigo)]/10">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">{client.name}</h3>
                    <span className="mt-0.5 inline-block rounded-full bg-[var(--panel-fill-2)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-3)]">
                      {client.role}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveWorkspace(client.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--panel-fill)] text-[var(--fg-3)] transition-colors hover:bg-[var(--sai-indigo)] hover:text-white"
                    title="Switch to Client Workspace"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--stroke)] pt-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">Active</p>
                    <p className="font-data mt-0.5 text-[14px] text-[var(--fg)]">{client.campaignsActive} <span className="text-[11px] text-[var(--fg-4)]">camp.</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">Spend</p>
                    <p className="font-data mt-0.5 text-[14px] text-[var(--fg)]">{fmtNaira(client.totalSpend)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">ROAS</p>
                    <p className="font-data mt-0.5 text-[14px] text-[var(--fg)]">{client.avgRoas.toFixed(1)}×</p>
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
