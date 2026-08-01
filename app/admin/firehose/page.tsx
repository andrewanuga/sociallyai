"use client";

import { useEffect, useState } from "react";
import { Flame, Loader2, Bot, MessageSquare } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import { fetchFirehose } from "./actions";
import { timeAgo } from "@/lib/dashboard/helpers";

type Action = {
  id: string;
  action: string;
  platform: string | null;
  comment: string;
  reply: string | null;
  reason: string | null;
  created_at: string;
  profiles: { full_name: string | null; username: string | null };
};

export default function AdminFirehose() {
  const { error: toastError } = useToast();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFirehose();
        setActions(data as any);
      } catch (e) {
        toastError("Couldn't load firehose");
      } finally {
        setLoading(false);
      }
    };
    
    load();
    const interval = setInterval(load, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Security operations" title="Agent Firehose" sub="Live feed of all autonomous AI actions across the platform." />

      <GlassCard className="p-0">
        <div className="border-b border-[var(--stroke)] p-5 flex items-center gap-2">
          <Flame className="h-5 w-5 text-[var(--sai-red)]" />
          <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Live Agent Activity</p>
          <div className="ml-2 flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[var(--sai-red)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--sai-red)]"></span>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[var(--sai-indigo)]" /></div>
        ) : actions.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[var(--fg-4)]">No agent actions recorded recently.</div>
        ) : (
          <div className="divide-y divide-[var(--stroke)]">
            {actions.map((a) => (
              <div key={a.id} className="p-4 transition-colors hover:bg-[var(--panel-fill)]">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-[var(--sai-indigo)]" />
                    <span className="font-display text-[13px] font-medium text-[var(--fg)]">
                      {a.profiles?.full_name || a.profiles?.username || "Unknown user"}
                    </span>
                    <Pill tone={a.action === "auto_reply" ? "green" : "indigo"}>{a.action.replace("_", " ")}</Pill>
                    {a.platform && <span className="text-[11px] uppercase text-[var(--fg-4)]">{a.platform}</span>}
                  </div>
                  <span className="text-[11px] text-[var(--fg-4)]">{timeAgo(a.created_at)}</span>
                </div>
                
                <div className="ml-6 space-y-2">
                  <div className="flex gap-2">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--fg-4)]" />
                    <p className="text-[13px] text-[var(--fg-3)]">
                      <span className="font-medium text-[var(--fg-2)]">Trigger:</span> "{a.comment}"
                    </p>
                  </div>
                  {a.reply && (
                    <div className="flex gap-2">
                      <Bot className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--sai-green)]" />
                      <p className="text-[13px] text-[var(--fg)]">
                        <span className="font-medium text-[var(--sai-green)]">Reply:</span> "{a.reply}"
                      </p>
                    </div>
                  )}
                  {a.reason && (
                    <p className="text-[12px] italic text-[var(--fg-4)]">Reasoning: {a.reason}</p>
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
