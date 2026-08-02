"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Loader2, Mail, Bot, User, MessageSquareMore } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

const SUPPORT_EMAIL = "socially.ai.io@gmail.com";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function SupportPage() {
  const supabase = createClient();
  const { error: toastError } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load latest chat
  useEffect(() => {
    async function loadChat() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get latest open chat
        const { data: chats } = await supabase
          .from("support_chats")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(1);

        if (chats && chats.length > 0) {
          setChatId(chats[0].id);
          // Load messages
          const { data: msgs } = await supabase
            .from("support_messages")
            .select("id, role, content")
            .eq("chat_id", chats[0].id)
            .order("created_at", { ascending: true });
            
          if (msgs) setMessages(msgs as Message[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, [supabase]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const submit = async () => {
    if (!input.trim() || sending) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          chatId
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const returnedChatId = res.headers.get("X-Chat-Id");
      if (returnedChatId && !chatId) setChatId(returnedChatId);

      if (!res.body) throw new Error("No response body");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
          ));
        }
      }
    } catch (e) {
      toastError("Error", e instanceof Error ? e.message : "Failed to connect to support agent");
      setMessages(prev => prev.filter(m => m.id !== userMsg.id)); // revert user message
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl h-[calc(100vh-140px)] flex flex-col">
      <PageHeader
        eyebrow="AI Support Agent"
        title="We're here to help"
        sub="Chat with our AI assistant for instant answers, or report a bug directly."
      />

      <GlassCard className="mt-5 flex-1 flex flex-col overflow-hidden">
        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--fg-4)]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[var(--fg-3)]">
              <Sparkles className="h-10 w-10 mb-3 opacity-50" style={{ color: "var(--sai-indigo)" }} />
              <p className="text-sm font-medium">Hello! I'm the Socially.AI support agent.</p>
              <p className="text-xs mt-1">How can I help you today?</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === 'user' ? 'bg-[var(--panel-fill-2)]' : 'bg-indigo-500/20'}`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-indigo-400" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${m.role === 'user' ? 'bg-[var(--panel-fill-2)] text-[var(--fg)]' : 'bg-transparent border border-[var(--stroke)] text-[var(--fg-2)]'}`}>
                  {m.content.split('\\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 border-t border-[var(--stroke)] bg-[var(--panel-fill)]/50">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Type your question or issue..."
              className="w-full rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] pl-5 pr-12 py-3 text-[14px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 transition-colors"
            />
            <button
              onClick={submit}
              disabled={!input.trim() || sending}
              className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sai-indigo)] text-white disabled:opacity-50 transition-transform hover:scale-105 active:scale-95"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -ml-0.5" />}
            </button>
          </div>
          <div className="mt-3 text-center">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1.5 text-[12px] text-[var(--fg-4)] transition-colors hover:text-[var(--fg-2)]">
              <Mail className="h-3.5 w-3.5" /> Need human help? Email {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
