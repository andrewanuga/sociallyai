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

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colLeads = filteredLeads.filter(l => l.status === col.id);
          return (
            <div key={col.id} className="flex h-full w-[320px] flex-shrink-0 flex-col rounded-2xl bg-[var(--panel-fill)] p-4 shadow-sm border border-[var(--stroke)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <h3 className="font-display text-[14px] font-semibold text-[var(--fg)]">{col.title}</h3>
                </div>
                <Pill tone="muted">{colLeads.length}</Pill>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colLeads.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[var(--stroke)] text-center text-[12px] text-[var(--fg-4)]">
                    No leads here
                  </div>
                ) : (
                  colLeads.map(lead => (
                    <div key={lead.id} className="group relative cursor-pointer rounded-xl border border-[var(--stroke)] bg-[var(--app-surface)] p-3 transition-all hover:border-[var(--sai-indigo)]/50 hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[13px] text-[var(--fg)]">{lead.recipient_handle}</span>
                          <span className="text-[10px] text-[var(--fg-4)] uppercase">{platformLabel(lead.platform)}</span>
                        </div>
                        <button className="opacity-0 transition-opacity group-hover:opacity-100 text-[var(--fg-4)] hover:text-[var(--fg)]">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--fg-3)] truncate">Camp: {lead.campaign_name}</p>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-[var(--fg-4)]">
                          {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : "Never"}
                        </span>
                        <div className="flex gap-1">
                          <button className="flex h-6 w-6 items-center justify-center rounded bg-[var(--panel-fill-2)] text-[var(--sai-indigo)] hover:bg-[var(--sai-indigo)] hover:text-white transition-colors" title="Message">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                          <button className="flex h-6 w-6 items-center justify-center rounded bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-colors" title="View Profile">
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
