"use client";

import { useState } from "react";
import { Target, Search, Filter, MoreHorizontal, MessageCircle, ExternalLink } from "lucide-react";
import { PageHeader, Pill } from "@/components/dashboard/ui";
import { platformLabel } from "@/lib/dashboard/helpers";

interface Lead {
  id: string;
  recipient_handle: string;
  status: string;
  campaign_name: string;
  platform: string;
  last_contacted_at: string | null;
  lead_score: number;
}

const COLUMNS = [
  { id: "pending", title: "Pending", color: "var(--fg-4)" },
  { id: "sent", title: "Outreach Sent", color: "var(--sai-indigo)" },
  { id: "replied", title: "Replied / Hot", color: "var(--sai-gold)" },
  { id: "closed", title: "Closed Won", color: "#34d399" },
];

export function CrmClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = leads.filter(l => l.recipient_handle.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="mx-auto flex max-w-full flex-col h-[calc(100vh-100px)]">
      <PageHeader
        eyebrow="Outbound CRM"
        title="Lead Pipeline"
        sub="Track leads progressing through your automated outreach campaigns."
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search handles..."
                className="h-9 w-64 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] pl-9 pr-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)] focus:outline-none"
              />
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="flex flex-1 gap-5 overflow-x-auto pb-6 pt-2 hide-scrollbar">
        {COLUMNS.map(col => {
          const colLeads = filteredLeads.filter(l => l.status === col.id);
          return (
            <div key={col.id} className="flex h-full w-[340px] flex-shrink-0 flex-col rounded-3xl bg-[var(--app-surface)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[var(--stroke)]/50 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full shadow-inner" style={{ backgroundColor: col.color, boxShadow: `0 0 10px ${col.color}40` }} />
                  <h3 className="font-display text-[15px] font-bold text-[var(--fg)] tracking-tight">{col.title}</h3>
                </div>
                <Pill tone="muted" className="bg-[var(--panel-fill-2)] px-3">{colLeads.length}</Pill>
              </div>
              
              <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 pb-4">
                {colLeads.length === 0 ? (
                  <div className="flex h-36 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--stroke)]/60 text-center text-[13px] font-medium text-[var(--fg-4)] bg-[var(--panel-fill-2)]/30">
                    Drop leads here
                  </div>
                ) : (
                  colLeads.map(lead => (
                    <div key={lead.id} className={`group relative cursor-pointer rounded-2xl border bg-[var(--panel-fill)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-[var(--app-surface)] ${lead.lead_score >= 70 ? 'border-[var(--sai-red)]/40 hover:border-[var(--sai-red)]/60 hover:shadow-[var(--sai-red)]/10' : 'border-[var(--stroke)] hover:border-[var(--sai-indigo)]/40 hover:shadow-[var(--sai-indigo)]/10'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-[14px] text-[var(--fg)] tracking-tight">{lead.recipient_handle}</span>
                          {lead.lead_score >= 70 && (
                            <span className="flex items-center justify-center rounded-full bg-[var(--sai-red)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--sai-red)] border border-[var(--sai-red)]/20 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                              🔥 {lead.lead_score}%
                            </span>
                          )}
                          <span className="rounded bg-[var(--panel-fill-2)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--fg-4)] ring-1 ring-inset ring-[var(--stroke)]/50">{platformLabel(lead.platform)}</span>
                        </div>
                        <button className="opacity-0 transition-opacity group-hover:opacity-100 text-[var(--fg-4)] hover:text-[var(--fg)] bg-[var(--panel-fill-2)] rounded-full p-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-[12px] text-[var(--fg-3)] truncate font-medium flex items-center gap-1.5">
                        <Target className="h-3 w-3 text-[var(--sai-indigo)]/70" />
                        {lead.campaign_name}
                      </p>
                      
                      <div className="mt-4 flex items-center justify-between border-t border-[var(--stroke)] pt-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fg-4)] flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-[var(--sai-green)]" />
                          {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : "Never"}
                        </span>
                        <div className="flex gap-1.5">
                          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sai-indigo)]/10 text-[var(--sai-indigo)] hover:bg-[var(--sai-indigo)] hover:text-white transition-all hover:scale-110 shadow-sm" title="Message">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-all hover:scale-110 ring-1 ring-inset ring-[var(--stroke)] shadow-sm" title="View Profile">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
