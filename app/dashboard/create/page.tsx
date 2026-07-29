"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, Copy, Check, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Msg = { id: number; role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Draft an X thread about our launch",
  "Turn this blog into a LinkedIn post",
  "3 hooks for a Reel on productivity",
  "Reply to a tough customer comment",
];

const GREETING: Msg = {
  id: 0,
  role: "assistant",
  content:
    "Hey — I'm your Socially agent. Tell me what you're working on and I'll draft it in your voice. Try a suggestion below, or just start typing.",
};

export default function CreatePage() {
  const { error: toastError } = useToast();
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const userMsg: Msg = { id: idRef.current++, role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== 0)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Request failed");
      const { reply } = await res.json();
      setMessages((prev) => [...prev, { id: idRef.current++, role: "assistant", content: reply }]);
    } catch (e) {
      toastError("Agent unavailable", e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = (m: Msg) => {
    navigator.clipboard?.writeText(m.content);
    setCopied(m.id);
    setTimeout(() => setCopied(null), 1400);
  };

  const reset = () => {
    setMessages([GREETING]);
    idRef.current = 1;
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--sai-indigo) 16%, transparent)" }}>
            <Sparkles className="h-5 w-5 text-[var(--sai-indigo)]" />
          </span>
          <div>
            <h1 className="font-display text-[17px] font-semibold text-white">Create</h1>
            <p className="text-[12px] text-white/45">Your personal Socially agent</p>
          </div>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.08]">
          <RotateCcw className="h-3.5 w-3.5" /> New chat
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="glass-panel flex-1 overflow-y-auto rounded-2xl p-4 sm:p-5">
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  m.role === "user" ? "text-white" : "text-white/85"
                }`}
                style={
                  m.role === "user"
                    ? { background: "linear-gradient(135deg,#6366f1,#a855f7)" }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === "assistant" && m.id !== 0 && (
                  <button
                    onClick={() => copy(m)}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#181820] text-white/50 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                    title="Copy"
                  >
                    {copied === m.id ? <Check className="h-3.5 w-3.5 text-[#34d399]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* suggestions */}
      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* composer */}
      <div className="mt-3">
        <div className="glass-panel flex items-end gap-2 rounded-2xl p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask your agent to draft, refine, or repurpose…"
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] text-white placeholder:text-white/35 focus:outline-none"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || busy}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition-transform hover:scale-105 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-white/30">
          Socially can draft and refine — always review before you post.
        </p>
      </div>
    </div>
  );
}
