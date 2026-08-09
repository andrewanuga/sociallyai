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
          <GlassCard className="relative flex flex-col items-center justify-center overflow-hidden py-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--sai-indigo)]/5 to-transparent" />
            <Megaphone className="relative z-10 mb-5 h-14 w-14 text-[var(--fg-4)] transition-transform hover:rotate-12 hover:scale-110 hover:text-[var(--sai-indigo)]" />
            <p className="relative z-10 font-display text-[20px] font-semibold text-[var(--fg)]">No campaigns yet</p>
            <p className="relative z-10 mt-2 max-w-md text-[14px] text-[var(--fg-3)]">
              Build your first automated outbound sequence. Target specific followers, trigger messages based on engagement, and track reply rates.
            </p>
            <button className="relative z-10 mt-8 rounded-full px-7 py-3 text-[15px] font-semibold text-white shadow-lg shadow-[var(--sai-indigo)]/20 transition-transform hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              Create Campaign
            </button>
          </GlassCard>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {campaigns.map(c => (
              <GlassCard key={c.id} className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--sai-indigo)]/20 hover:border-[var(--sai-indigo)]/40">
                {/* Active Campaign Glow effect */}
                {c.status === "active" && (
                  <div className="absolute -left-px top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--sai-indigo)] to-[var(--sai-violet)]" />
                )}
                
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="font-display text-[16px] font-semibold text-[var(--fg)] tracking-tight">{c.name}</h3>
                      <Pill tone={c.status === "active" ? "green" : c.status === "draft" ? "muted" : "violet"}>{c.status}</Pill>
                    </div>
                    <p className="text-[12px] text-[var(--fg-4)]">Platform: <span className="font-medium text-[var(--fg-2)]">{platformLabel(c.platform)}</span></p>
                  </div>
                  {c.status === "active" ? (
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-fill-2)] text-[var(--fg-3)] ring-1 ring-inset ring-[var(--stroke)] transition-all hover:bg-[var(--sai-gold)] hover:text-[var(--app-bg)] hover:ring-[var(--sai-gold)] shadow-sm" title="Pause">
                      <Pause className="h-[18px] w-[18px] fill-current" />
                    </button>
                  ) : (
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-fill-2)] text-[var(--fg-3)] ring-1 ring-inset ring-[var(--stroke)] transition-all hover:bg-[var(--sai-indigo)] hover:text-white hover:ring-[var(--sai-indigo)] shadow-sm" title="Start">
                      <Play className="h-[18px] w-[18px] fill-current ml-0.5" />
                    </button>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-4 gap-3 border-t border-[var(--stroke)] pt-5">
                  <div className="rounded-xl bg-[var(--panel-fill-2)] p-3 text-center ring-1 ring-inset ring-[var(--stroke)] transition-colors group-hover:bg-[var(--panel-fill)] group-hover:ring-[var(--sai-indigo)]/20">
                    <p className="font-data text-[18px] font-semibold text-[var(--fg)]">{c.stats.totalLeads}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]">Targeted</p>
                  </div>
                  <div className="rounded-xl bg-[var(--panel-fill-2)] p-3 text-center ring-1 ring-inset ring-[var(--stroke)] transition-colors group-hover:bg-[var(--panel-fill)] group-hover:ring-[var(--sai-indigo)]/20">
                    <p className="font-data text-[18px] font-semibold text-[var(--fg)]">{c.stats.sentCount}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]">Sent</p>
                  </div>
                  <div className="rounded-xl bg-[var(--panel-fill-2)] p-3 text-center ring-1 ring-inset ring-[var(--stroke)] transition-colors group-hover:bg-[var(--panel-fill)] group-hover:ring-[var(--sai-indigo)]/20">
                    <p className="font-data text-[18px] font-semibold text-[var(--fg)]">{c.stats.repliedCount}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]">Replies</p>
                  </div>
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[var(--sai-indigo)]/10 to-[var(--sai-violet)]/10 p-3 text-center ring-1 ring-inset ring-[var(--sai-indigo)]/30 transition-transform group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--sai-indigo)]/10 to-transparent" />
                    <p className="relative z-10 font-data text-[18px] font-bold text-[var(--sai-indigo)] drop-shadow-sm">{c.stats.replyRate.toFixed(1)}%</p>
                    <p className="relative z-10 mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--sai-indigo)]/80">Rate</p>
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
