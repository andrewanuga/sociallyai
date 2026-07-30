"use client";

import { useState } from "react";
import { Bug, Sparkles, LifeBuoy, MessageSquareMore, Loader2, Send, Mail } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";

const SUPPORT_EMAIL = "socially.ai.io@gmail.com";

const CATEGORIES = [
  { id: "bug", label: "Report a bug", desc: "Something isn't working right.", icon: Bug, tone: "var(--sai-red)" },
  { id: "feature", label: "Request a feature", desc: "Something you'd love to see added.", icon: Sparkles, tone: "var(--sai-violet)" },
  { id: "help", label: "Get help", desc: "You're stuck and need a hand.", icon: LifeBuoy, tone: "var(--sai-indigo)" },
  { id: "other", label: "Something else", desc: "Anything not covered above.", icon: MessageSquareMore, tone: "var(--sai-gold)" },
] as const;

export default function SupportPage() {
  const { success, error: toastError } = useToast();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("bug");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      success("Message sent", "Our team will get back to you.");
      setSent(true); setMessage("");
    } catch (e) {
      toastError("Couldn't send", e instanceof Error ? e.message : undefined);
    } finally { setBusy(false); }
  };

  const active = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="We're listening"
        title="Support"
        sub="Report a bug, request a feature, or ask for help — it goes straight to our team."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((c) => {
          const on = category === c.id;
          return (
            <button key={c.id} onClick={() => { setCategory(c.id); setSent(false); }}
              className="flex items-start gap-3 rounded-2xl border p-4 text-left transition-all"
              style={{ borderColor: on ? "rgba(99,102,241,0.6)" : "var(--stroke)", background: on ? "color-mix(in srgb, var(--sai-indigo) 12%, transparent)" : "var(--panel-fill)" }}>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${c.tone} 16%, transparent)` }}>
                <c.icon className="h-5 w-5" style={{ color: c.tone }} />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-[var(--fg)]">{c.label}</span>
                <span className="mt-0.5 block text-[12.5px] text-[var(--fg-3)]">{c.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <GlassCard className="mt-5 p-5">
        <label className="font-data mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[var(--fg-3)]">
          <active.icon className="h-3.5 w-3.5" style={{ color: active.tone }} /> {active.label}
        </label>
        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); setSent(false); }}
          rows={6}
          placeholder={
            category === "bug" ? "What happened? What did you expect? Steps to reproduce help a lot."
            : category === "feature" ? "What would you like to see, and what problem would it solve?"
            : category === "help" ? "What are you trying to do, and where are you stuck?"
            : "Tell us what's on your mind…"
          }
          className="w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3.5 text-[14px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50"
        />
        <div className="mt-4 flex items-center justify-between">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg)]">
            <Mail className="h-3.5 w-3.5" /> or email {SUPPORT_EMAIL}
          </a>
          <button onClick={submit} disabled={!message.trim() || busy}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 26px -10px rgba(99,102,241,0.8)" }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send message
          </button>
        </div>
        {sent && <p className="mt-3 text-[12.5px]" style={{ color: "#34d399" }}>Thanks — we&apos;ve received your message and will follow up by email.</p>}
      </GlassCard>
    </div>
  );
}
