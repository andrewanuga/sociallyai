"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, CheckCircle2, MessageSquare, Loader2 } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { resolveTicket } from "./actions";
import { timeAgo } from "@/lib/dashboard/helpers";

type Ticket = { 
  id: string; 
  user_id: string; 
  category: "bug" | "feature" | "help" | "other"; 
  message: string; 
  email: string; 
  status: "open" | "resolved"; 
  created_at: string;
};

export default function AdminSupport() {
  const { success, error: toastError } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  
  const load = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setTickets(data as Ticket[]);
    } catch (e) {
      toastError("Couldn't load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id: string) => {
    setBusy(id);
    try {
      await resolveTicket(id);
      success("Ticket marked as resolved");
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "resolved" } : t)));
    } catch (e) {
      toastError("Couldn't resolve ticket");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Customer Operations" title="Support Tickets" sub="View and manage user inquiries, bugs, and feature requests." />

      <GlassCard className="p-5">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[var(--sai-indigo)]" /></div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <LifeBuoy className="mb-3 h-8 w-8 text-[var(--fg-4)]" />
            <p className="text-[14px] font-medium text-[var(--fg)]">No support tickets</p>
            <p className="mt-1 text-[13px] text-[var(--fg-4)]">Your inbox is clear! Check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="flex flex-col gap-4 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 transition-colors hover:border-[var(--stroke-hover)] sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Pill tone={t.category === "bug" ? "red" : t.category === "feature" ? "indigo" : t.category === "help" ? "gold" : "gray"}>
                      {t.category.toUpperCase()}
                    </Pill>
                    <span className="text-[12px] text-[var(--fg-4)]">{timeAgo(t.created_at)}</span>
                  </div>
                  
                  <div className="mt-3 flex items-start gap-3">
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fg-3)]" />
                    <div>
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--fg)]">{t.message}</p>
                      <p className="mt-2 text-[12px] text-[var(--fg-4)]">
                        From: <span className="font-medium text-[var(--fg-2)]">{t.email || "Unknown User"}</span> ({t.user_id})
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex shrink-0 items-center gap-3">
                  {t.status === "resolved" ? (
                    <div className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] px-2.5 py-1 text-[11px] font-medium text-[var(--fg-3)]">
                      <CheckCircle2 className="h-3 w-3" /> Resolved
                    </div>
                  ) : (
                    <button
                      onClick={() => handleResolve(t.id)}
                      disabled={busy === t.id}
                      className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[var(--stroke)] px-3 text-[12px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] disabled:opacity-50"
                    >
                      {busy === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-[var(--sai-indigo)]" />} 
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
