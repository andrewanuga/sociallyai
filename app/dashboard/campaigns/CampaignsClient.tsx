"use client";

import { useState } from "react";
import { Megaphone, Play, Pause, Plus, Filter, MessageSquareText, TrendingUp, Users } from "lucide-react";
import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";
import { platformLabel } from "@/lib/dashboard/helpers";

interface CampaignStat {
  id: string;
  name: string;
  platform: string;
  status: string;
  audience_filter?: Record<string, any>;
  message_sequence?: any[];
  stats: {
    totalLeads: number;
    sentCount: number;
    repliedCount: number;
    replyRate: number;
  };
}

export function CampaignsClient({ initialCampaigns }: { initialCampaigns: CampaignStat[] }) {
  const [campaigns, setCampaigns] = useState<CampaignStat[]>(initialCampaigns);

  const totals = {
    active: campaigns.filter(c => c.status === "active").length,
    sent: campaigns.reduce((sum, c) => sum + c.stats.sentCount, 0),
    replied: campaigns.reduce((sum, c) => sum + c.stats.repliedCount, 0),
  };

  const avgReplyRate = totals.sent > 0 ? (totals.replied / totals.sent) * 100 : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Outbound CRM"
        title="DM Campaigns"
        sub="Build dynamic outreach sequences, filter audiences, and drip messages over time."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 24px -10px rgba(99,102,241,0.8)" }}>
            <Plus className="h-4 w-4" /> New Campaign
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Active Campaigns" value={String(totals.active)} icon={Megaphone} tone="indigo" />
        <StatTile label="Messages Sent" value={String(totals.sent)} icon={MessageSquareText} tone="violet" />
        <StatTile label="Replies Received" value={String(totals.replied)} icon={Users} tone="green" />
        <StatTile label="Avg Reply Rate" value={`${avgReplyRate.toFixed(1)}%`} icon={TrendingUp} tone="gold" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[16px] font-semibold text-[var(--fg)]">All Campaigns</h2>
            <Pill tone="muted">{campaigns.length}</Pill>
          </div>
          <button className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[12px] font-medium text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>

        {campaigns.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="mb-4 h-12 w-12 text-[var(--fg-4)]" />
            <p className="font-medium text-[var(--fg-2)]">No campaigns yet</p>
            <p className="mt-1 max-w-md text-[13px] text-[var(--fg-4)]">
              Build your first automated outbound sequence. Target specific followers, trigger messages based on engagement, and track reply rates.
            </p>
            <button className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              Create Campaign
            </button>
          </GlassCard>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {campaigns.map(c => (
              <GlassCard key={c.id} className="p-5 transition-colors hover:border-[var(--stroke-hover)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">{c.name}</h3>
                      <Pill tone={c.status === "active" ? "green" : c.status === "draft" ? "muted" : "violet"}>{c.status}</Pill>
                    </div>
                    <p className="text-[12px] text-[var(--fg-4)]">Platform: <span className="font-medium text-[var(--fg-2)]">{platformLabel(c.platform)}</span></p>
                  </div>
                  {c.status === "active" ? (
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]" title="Pause">
                      <Pause className="h-4 w-4" />
                    </button>
                  ) : (
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]" title="Start">
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2 border-t border-[var(--stroke)] pt-4">
                  <div className="rounded-lg bg-[var(--panel-fill-2)] p-2 text-center">
                    <p className="font-data text-[14px] text-[var(--fg)]">{c.stats.totalLeads}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--fg-4)]">Targeted</p>
                  </div>
                  <div className="rounded-lg bg-[var(--panel-fill-2)] p-2 text-center">
                    <p className="font-data text-[14px] text-[var(--fg)]">{c.stats.sentCount}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--fg-4)]">Sent</p>
                  </div>
                  <div className="rounded-lg bg-[var(--panel-fill-2)] p-2 text-center">
                    <p className="font-data text-[14px] text-[var(--fg)]">{c.stats.repliedCount}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--fg-4)]">Replies</p>
                  </div>
                  <div className="rounded-lg bg-[var(--panel-fill-2)] p-2 text-center">
                    <p className="font-data text-[14px] text-[var(--sai-gold)]">{c.stats.replyRate.toFixed(1)}%</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--fg-4)]">Rate</p>
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
