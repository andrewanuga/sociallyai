"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, ArrowUp } from "lucide-react";

type Msg = { id: number; role: "user" | "assistant"; content: string };

const STYLES = `
  @keyframes sai-pop { 0%{opacity:0;transform:scale(.9) translateY(16px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  .sai-assist-pop { animation: sai-pop .28s cubic-bezier(0.16,1,0.3,1) forwards; }
`;

const GREETING: Msg = {
  id: 0, role: "assistant",
  content: "Hey — I'm your Socially agent. Ask me to draft a post, plan your week, or summarise your inbox.",
};

const FloatingAiAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element;
      if (panelRef.current && !panelRef.current.contains(t) && !t.closest(".sai-assist-fab")) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const send = async () => {
    const content = input.trim();
    if (!content || busy) return;
    const history = [...messages, { id: idRef.current++, role: "user" as const, content }];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((m) => m.id !== 0).map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "failed");
      const { reply } = await res.json();
      setMessages((p) => [...p, { id: idRef.current++, role: "assistant", content: reply }]);
    } catch {
      setMessages((p) => [...p, { id: idRef.current++, role: "assistant", content: "I hit a snag reaching the model. Try again in a moment." }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Socially assistant"
        className="sai-assist-fab relative flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform duration-300 hover:scale-105"
        style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 30px -6px rgba(99,102,241,0.8)" }}
      >
        <span className="absolute inset-0 rounded-full border border-white/15" />
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
        {!open && <span className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: "#6366f1" }} />}
      </button>

      {/* Panel */}
      {open && (
        <div ref={panelRef} className="sai-assist-pop absolute bottom-[70px] right-0 w-[min(88vw,380px)] origin-bottom-right">
          <div className="glass-panel flex flex-col overflow-hidden rounded-3xl" style={{ background: "var(--app-surface)", height: 460 }}>
            {/* header */}
            <div className="flex items-center justify-between border-b border-[var(--stroke)] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--sai-indigo) 16%, transparent)" }}>
                  <Sparkles className="h-4 w-4 text-[var(--sai-indigo)]" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--fg)]">Socially agent</p>
                  <p className="flex items-center gap-1 text-[11px] text-[var(--fg-4)]"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#34d399" }} /> Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"><X className="h-4 w-4" /></button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                    style={m.role === "user"
                      ? { background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff" }
                      : { background: "var(--panel-fill-2)", color: "var(--fg-2)", border: "1px solid var(--stroke)" }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3.5 py-3">
                    {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: "var(--fg-4)", animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* composer */}
            <div className="border-t border-[var(--stroke)] p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-1.5">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  placeholder="Ask your agent…"
                  className="max-h-24 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-[13px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)]"
                />
                <button onClick={send} disabled={!input.trim() || busy} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white transition-transform hover:scale-105 disabled:opacity-40" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { FloatingAiAssistant };
