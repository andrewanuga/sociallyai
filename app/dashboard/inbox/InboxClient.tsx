"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MessageSquare, Sparkles, Layers, Plug, Send as SendIcon,
  Camera, Play, AtSign, Building2, Users, Hash, Ghost, MessagesSquare, MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Pill } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import type { PlatformId } from "@/lib/social/platforms";
import type { SocialAccount, SocialInboxMessage } from "@/lib/social/types";

const ICONS: Record<PlatformId | "system", React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  instagram: Camera, youtube: Play, x: AtSign, linkedin: Building2, facebook: Users,
  threads: Hash, snapchat: Ghost, reddit: MessagesSquare, telegram: SendIcon, whatsapp: MessageCircle,
  system: Sparkles,
};
const COLORS: Record<PlatformId | "system", string> = {
  instagram: "#E1306C", youtube: "#FF0000", x: "#1DA1F2", linkedin: "#0A66C2", facebook: "#1877F2",
  threads: "#a855f7", snapchat: "#FFFC00", reddit: "#FF4500", telegram: "#229ED9", whatsapp: "#25D366",
  system: "#6366f1",
};

const catTone = (c: string) => (c === "complaint" ? "red" : c === "lead" ? "gold" : c === "question" ? "indigo" : "muted") as "red" | "gold" | "indigo" | "muted";

export function InboxClient({ accounts, messages }: { accounts: SocialAccount[]; messages: SocialInboxMessage[] }) {
  const { success } = useToast();
  const [tab, setTab] = useState<string>("all"); // "all" or account.id
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [reply, setReply] = useState("");
  const [replied, setReplied] = useState<Record<string, boolean>>({});

  // Stack per tab: newest-first (LIFO — the top is handled first).
  const stack = useMemo(
    () => (tab === "all" ? messages : messages.filter((m) => m.account_id === tab)),
    [tab, messages]
  );
  const selected = messages.find((m) => m.id === selectedId) ?? stack[0] ?? null;
  const unreadFor = (accId: string) => messages.filter((m) => m.account_id === accId && !m.is_read).length;
  const initials = (n: string | null) => (n ?? "?").split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  const sendReply = async (m: SocialInboxMessage) => {
    if ((m.platform as string) !== "system" && !reply.trim()) return;
    setReplied((r) => ({ ...r, [m.id]: true }));
    const supabase = createClient();
    if ((m.platform as string) === "system") {
      await supabase.from("user_notifications").update({ is_read: true }).eq("id", m.id);
      success("Notification dismissed");
    } else {
      await supabase.from("social_inbox").update({ replied: true, reply_body: reply, is_read: true }).eq("id", m.id);
      success("Reply sent");
    }
    setReply("");
  };

  // No accounts yet → prompt to connect.
  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="Workspace" title="Inbox" sub="Every DM, comment, and mention from your connected accounts — in one stack." />
        <div className="glass-panel flex flex-col items-center rounded-2xl p-12 text-center">
          <Plug className="mb-3 h-10 w-10 text-[var(--fg-4)]" />
          <p className="font-medium text-[var(--fg-2)]">No accounts connected</p>
          <p className="mt-1 text-[13px] text-[var(--fg-4)]">Connect a social account to start receiving messages here.</p>
          <Link href="/dashboard/integrations" className="mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Connect an account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Workspace" title="Inbox" sub="One tab per account. Newest message sits on top of the stack." />

      {/* Account tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setTab("all")} className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all"
          style={tab === "all" ? { borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.12)", color: "var(--fg)" } : { borderColor: "var(--stroke)", color: "var(--fg-2)" }}>
          <Layers className="h-3.5 w-3.5" /> All <span className="opacity-60">({messages.length})</span>
        </button>
        {accounts.map((a) => {
          const Icon = ICONS[a.platform]; const unread = unreadFor(a.id); const active = tab === a.id;
          return (
            <button key={a.id} onClick={() => setTab(a.id)} className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all"
              style={active ? { borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.12)", color: "var(--fg)" } : { borderColor: "var(--stroke)", color: "var(--fg-2)" }}>
              {Icon && <Icon className="h-3.5 w-3.5" style={{ color: COLORS[a.platform as PlatformId | "system"] }} />}
              <span className="lowercase">{a.platform}</span>
              <span className="opacity-50">/</span>
              <span className="max-w-[90px] truncate">{a.handle || a.display_name || "account"}</span>
              {unread > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white" style={{ background: "var(--sai-red)" }}>{unread}</span>}
            </button>
          );
        })}
      </div>

      <div className="grid h-[calc(100vh-290px)] gap-5 lg:grid-cols-3">
        {/* stack */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[var(--fg-3)]">
            <Layers className="h-4 w-4 text-[var(--sai-indigo)]" />
            <span className="font-data text-[11px] uppercase tracking-[0.18em]">Stack · {stack.length}</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {stack.length === 0 ? (
              <div className="py-12 text-center"><MessageSquare className="mx-auto mb-2 h-8 w-8 text-[var(--fg-4)]" /><p className="text-sm text-[var(--fg-4)]">No messages yet.</p><p className="mt-1 text-[12px] text-[var(--fg-4)]">They&apos;ll appear here once your account syncs.</p></div>
            ) : stack.map((m, i) => (
              <div key={m.id} onClick={() => setSelectedId(m.id)} className="glass-panel cursor-pointer rounded-xl p-3 transition-all"
                style={selected?.id === m.id ? { borderColor: "rgba(99,102,241,0.45)" } : i === 0 ? { borderColor: "rgba(99,102,241,0.25)" } : undefined}>
                <div className="mb-1.5 flex items-center gap-2">
                  {i === 0 && <Pill tone="indigo">Top</Pill>}
                  <span className="flex-1 truncate text-sm font-medium text-[var(--fg)]">{m.author_name ?? m.author_handle ?? "Unknown"}</span>
                  {(m.importance === "flagged" || m.importance === "urgent") && <Pill tone="gold">{m.importance}</Pill>}
                  {!m.is_read && !replied[m.id] && <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: "var(--sai-red)" }} />}
                </div>
                <p className="line-clamp-2 text-[12.5px] text-[var(--fg-3)]">{m.body}</p>
                <div className="mt-1.5 flex items-center gap-2"><Pill tone={catTone(m.category)}>{m.category}</Pill><span className="text-[11px] text-[var(--fg-4)]">{m.kind}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* thread */}
        {selected ? (
          <div className="glass-panel flex flex-col overflow-hidden rounded-2xl lg:col-span-2">
            <div className="flex items-center gap-3 border-b border-[var(--stroke)] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>{initials(selected.author_name)}</div>
              <div className="flex-1"><p className="font-medium text-[var(--fg)]">{selected.author_name ?? selected.author_handle ?? "Unknown"}</p><p className="text-[12px] text-[var(--fg-4)]">{selected.platform} · {selected.kind} · {new Date(selected.received_at).toLocaleString()}</p></div>
              <Pill tone={catTone(selected.category)}>{selected.category}</Pill>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-lg">
                <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-4"><p className="text-sm leading-relaxed text-[var(--fg)]">{selected.body}</p></div>
                {selected.category === "lead" && (
                  <div className="mt-4 rounded-xl border border-[var(--sai-gold)]/20 bg-[var(--sai-gold)]/[0.06] p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-[var(--sai-gold)]"><Sparkles className="h-3.5 w-3.5" /> AI suggested reply</p>
                    <p className="text-sm leading-relaxed text-[var(--fg-2)]">Hi {(selected.author_name ?? "there").split(" ")[0]}! Thanks for reaching out 🙌 {selected.reply_body || "Happy to share more — here's a quick overview."}</p>
                  </div>
                )}
              </div>
            </div>
            {(selected.platform as string) !== "system" ? (
              <div className="border-t border-[var(--stroke)] p-4">
                <textarea placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} className="mb-3 min-h-[80px] w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50" />
                <div className="flex items-center justify-between">
                  <button onClick={() => setReply((r) => r || "Hi! Thanks for reaching out — here's a quick overview…")} className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 py-1.5 text-[12px] text-[var(--fg-2)] hover:bg-[var(--hover)]">Use AI suggestion</button>
                  <button onClick={() => sendReply(selected)} className="rounded-full px-4 py-1.5 text-[12.5px] font-semibold text-white transition-transform hover:scale-[1.03]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>Send reply</button>
                </div>
              </div>
            ) : (
              <div className="border-t border-[var(--stroke)] p-4 flex justify-end">
                <button onClick={() => sendReply(selected)} className="rounded-full px-4 py-1.5 text-[12.5px] font-semibold text-white transition-transform hover:scale-[1.03]" style={{ background: "var(--panel-fill-2)", color: "var(--fg-2)", border: "1px solid var(--stroke)" }}>Dismiss notification</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-[var(--stroke)] lg:col-span-2">
            <div className="text-center"><MessageSquare className="mx-auto mb-3 h-12 w-12 text-[var(--fg-4)]" /><p className="text-[var(--fg-4)]">Select a message to reply</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
