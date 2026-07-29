"use client";

import { useState } from "react";
import { MessageSquare, UserCheck, AlertCircle, Smile, Sparkles } from "lucide-react";
import { PageHeader, Pill } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import type { InboxMessage, InboxCategory } from "@/lib/supabase/types";

const CATEGORY_META: Record<InboxCategory | "all", { label: string; icon: typeof MessageSquare; color: string }> = {
  leads: { label: "Leads", icon: UserCheck, color: "var(--sai-gold)" },
  complaints: { label: "Complaints", icon: AlertCircle, color: "var(--sai-red)" },
  fluff: { label: "Fluff", icon: Smile, color: "rgba(255,255,255,0.5)" },
  all: { label: "All", icon: MessageSquare, color: "var(--sai-indigo)" },
};

const catTone = (c: InboxCategory) => (c === "complaints" ? "red" : c === "leads" ? "gold" : "muted") as "red" | "gold" | "muted";

export function InboxClient({ messages }: { messages: InboxMessage[] }) {
  const { success } = useToast();
  const [activeCategory, setActiveCategory] = useState<InboxCategory | "all">("leads");
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [reply, setReply] = useState("");

  const filtered = activeCategory === "all" ? messages : messages.filter((m) => m.category === activeCategory);
  const selected = messages.find((m) => m.id === selectedId);
  const counts = {
    leads: messages.filter((m) => m.category === "leads").length,
    complaints: messages.filter((m) => m.category === "complaints").length,
    fluff: messages.filter((m) => m.category === "fluff").length,
    all: messages.length,
  };
  const initials = (name: string | null) => (name ?? "?").split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  const send = () => { if (!reply.trim()) return; success("Reply sent"); setReply(""); };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Workspace" title="Smart Inbox" sub="AI-triaged by intent — leads first, fluff last." />

      <div className="grid h-[calc(100vh-230px)] gap-5 lg:grid-cols-3">
        {/* list */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(["leads", "complaints", "fluff", "all"] as const).map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all"
                  style={active ? { borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.12)", color: "#fff" } : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
                  <meta.icon className="h-3.5 w-3.5" style={{ color: meta.color }} /> {meta.label}
                  <span className="ml-0.5 text-[11px] opacity-60">({counts[cat]})</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="py-12 text-center"><MessageSquare className="mx-auto mb-2 h-8 w-8 text-white/20" /><p className="text-sm text-white/40">No messages here.</p></div>
            ) : filtered.map((msg) => (
              <div key={msg.id} onClick={() => setSelectedId(msg.id)} className="glass-panel cursor-pointer rounded-xl p-3 transition-all"
                style={selectedId === msg.id ? { borderColor: "rgba(99,102,241,0.45)" } : undefined}>
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>{initials(msg.author_name)}</div>
                  <span className="flex-1 truncate text-sm font-medium text-white">{msg.author_name ?? "Unknown"}</span>
                  {!msg.is_read && <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: "var(--sai-red)" }} />}
                  <span className="flex-shrink-0 text-[11px] text-white/35">{new Date(msg.received_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="line-clamp-2 text-[12.5px] text-white/50">{msg.message}</p>
                <div className="mt-1.5 flex items-center gap-2"><Pill tone={catTone(msg.category)}>{msg.category}</Pill><span className="text-[11px] text-white/35">{msg.platform}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* thread */}
        {selected ? (
          <div className="glass-panel flex flex-col overflow-hidden rounded-2xl lg:col-span-2">
            <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>{initials(selected.author_name)}</div>
              <div className="flex-1"><p className="font-medium text-white">{selected.author_name ?? "Unknown"}</p><p className="text-[12px] text-white/40">{selected.platform} · {new Date(selected.received_at).toLocaleString()}</p></div>
              <Pill tone={catTone(selected.category)}>{selected.category}</Pill>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-lg">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"><p className="text-sm leading-relaxed text-white/85">{selected.message}</p></div>
                {selected.category === "leads" && (
                  <div className="mt-4 rounded-xl border border-[var(--sai-gold)]/20 bg-[var(--sai-gold)]/[0.06] p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-[var(--sai-gold)]"><Sparkles className="h-3.5 w-3.5" /> AI suggested reply</p>
                    <p className="text-sm leading-relaxed text-white/60">Hi {selected.author_name?.split(" ")[0]}! Thanks for reaching out 🙌 {selected.reply_content || "I'd love to tell you more — let me send you a quick overview."}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/[0.06] p-4">
              <textarea placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} className="mb-3 min-h-[80px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--sai-indigo)]/50" />
              <div className="flex items-center justify-between">
                <button onClick={() => setReply((r) => r || "Hi! Thanks for reaching out — here's a quick overview…")} className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.08]">Use AI suggestion</button>
                <button onClick={send} className="rounded-full px-4 py-1.5 text-[12.5px] font-semibold text-white transition-transform hover:scale-[1.03]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Send reply</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 lg:col-span-2">
            <div className="text-center"><MessageSquare className="mx-auto mb-3 h-12 w-12 text-white/15" /><p className="text-white/40">Select a message to reply</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
