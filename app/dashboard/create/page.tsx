"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowUp, Sparkles, Copy, Check, RotateCcw, Paperclip, X,
  FileText, Film, Bot, Eye, ChevronDown, Loader2, Image as ImageIcon, Edit2, MessageSquare, Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { MarkdownRenderer } from "@/components/dashboard/MarkdownRenderer";

/* ── Types ────────────────────────────────────────────────────── */

type Attachment = {
  id: number;
  type: "image" | "video" | "file";
  name: string;
  mime: string;
  preview?: string;
  dataUrl?: string;
  content?: string;
};

type Msg = {
  id: string | number;
  role: "user" | "assistant";
  content: string;
  model?: string;
  attachments?: { type: Attachment["type"]; name: string; preview?: string }[];
};

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  supportsVision: boolean;
  tier?: string;
}

const MAX_MB = 25;

const SUGGESTIONS = [
  "Draft an X thread about our launch",
  "Turn this blog into a LinkedIn post",
  "3 hooks for a Reel on productivity",
  "Reply to a tough customer comment",
  "Write a bio that stops the scroll",
  "5 content ideas for this week",
];

const AGENT_TOOLS = [
  { id: "schedule_post", name: "Schedule Post", desc: "Push a draft to calendar", promptSuffix: "schedule the post we just drafted.", needsParams: false },
  { id: "fetch_post_analytics", name: "Check Analytics", desc: "Analyze recent post metrics", promptSuffix: "fetch my recent post analytics and summarize them.", needsParams: false },
  { id: "get_viral_formats", name: "Viral Formats", desc: "Get proven hook templates", promptSuffix: "get viral formats and suggest a draft using one of them.", needsParams: false },
  { id: "fetch_unread_messages", name: "Check Inbox", desc: "Read recent DMs/comments", promptSuffix: "fetch my unread messages from [platform/handle].", needsParams: true },
  { id: "send_message", name: "Send Message", desc: "Send a direct message", promptSuffix: "send a message to [recipient] on [platform] saying [message].", needsParams: true },
  { id: "analyze_competitor", name: "Analyze Competitor", desc: "Research a competitor's strategy", promptSuffix: "analyze the content strategy of [competitor_handle].", needsParams: true },
  { id: "evaluate_virality", name: "Evaluate Virality", desc: "Score a draft's potential", promptSuffix: "evaluate the virality potential of this draft.", needsParams: false },
];

const GREETING: Msg = {
  id: 0,
  role: "assistant",
  content:
    "Hey — I'm your Socially agent. Tell me what you're working on and I'll draft it in your voice.\n\nAttach images or documents for context, pick your AI model below, and I'll handle the rest. ✨",
};

/* ── Model display name helper ────────────────────────────────── */

function modelDisplayName(id: string, models: ModelOption[]): string {
  const found = models.find((m) => m.id === id);
  if (found) return found.name;
  const parts = id.split("/");
  return parts[parts.length - 1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Main component ───────────────────────────────────────────── */

export default function CreatePage() {
  const { error: toastError } = useToast();
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [streamText, setStreamText] = useState("");

  // Model selection
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [userDefaultModel, setUserDefaultModel] = useState<string>("");

  const [showToolPicker, setShowToolPicker] = useState(false);

  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const toolPickerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const attIdRef = useRef(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setBusy(false);
      setStreamText("");
      
      const last = messages[messages.length - 1];
      if (last && last.role === 'user') {
        setInput(last.content !== "(see attachment)" ? last.content : "");
        setMessages(messages.slice(0, -1));
      }
    }
  }, [messages]);

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();
    await supabase.from("chats").delete().eq("id", id);
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) reset();
  };


  const fetchChats = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("chats").select("id, title").order("updated_at", { ascending: false });
    if (data) setChats(data);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const loadChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    setMessages([GREETING]);
    setBusy(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.from("chat_messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true });
      if (data && data.length > 0) {
        setMessages([GREETING, ...data.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          model: msg.model,
          attachments: msg.attachments || []
        }))]);
      }
    } catch {
    } finally {
      setBusy(false);
    }
  };

  const saveRename = async (id: string, newTitle: string) => {
    setRenamingChatId(null);
    if (!newTitle.trim()) return;
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, title: newTitle } : c));
    const supabase = createClient();
    await supabase.from("chats").update({ title: newTitle }).eq("id", id);
  };

  /* ── Load user profile and models ───────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("ai_model")
            .eq("id", user.id)
            .single();
          if (profile?.ai_model) {
            setSelectedModel(profile.ai_model);
            setUserDefaultModel(profile.ai_model);
          }
        }
      } catch { /* offline */ }

      // Load models
      try {
        const res = await fetch("/api/ai/models");
        const data = await res.json();
        const recommended = (data.recommended || []).map((m: ModelOption & Record<string, unknown>) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          supportsVision: m.supportsVision,
          tier: m.tier,
        }));
        setModels(recommended);
      } catch { /* offline */ }
    })();
  }, []);

  /* ── Close model picker on outside click ────────────────────── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
      if (toolPickerRef.current && !toolPickerRef.current.contains(e.target as Node)) {
        setShowToolPicker(false);
      }
    }
    if (showModelPicker || showToolPicker) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showModelPicker]);

  /* ── Auto-scroll ────────────────────────────────────────────── */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, streamText]);

  /* ── Auto-resize textarea ───────────────────────────────────── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, [input]);

  /* ── File handling ──────────────────────────────────────────── */
  const readFile = (file: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  const readText = (file: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsText(file);
    });

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > MAX_MB * 1024 * 1024) {
        toastError("File too large", `${file.name} exceeds ${MAX_MB}MB.`);
        continue;
      }
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isText = file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name);
      const att: Attachment = {
        id: attIdRef.current++,
        type: isImage ? "image" : isVideo ? "video" : "file",
        name: file.name,
        mime: file.type || "application/octet-stream",
      };
      try {
        if (isImage) {
          att.preview = URL.createObjectURL(file);
          att.dataUrl = await readFile(file);
        } else if (isVideo) {
          att.preview = URL.createObjectURL(file);
        } else if (isText) {
          att.content = await readText(file);
        }
      } catch { /* ignore read errors */ }
      setAttachments((prev) => [...prev, att]);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeAttachment = (id: number) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  /* ── Check if current model supports vision ─────────────────── */
  const currentModelInfo = models.find((m) => m.id === selectedModel);
  const hasVision = currentModelInfo?.supportsVision ?? true;
  const hasImageAttachments = attachments.some((a) => a.type === "image");

  /* ── Send message ───────────────────────────────────────────── */
  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if ((!content && attachments.length === 0) || busy) return;
    const sending = [...attachments];
    const userMsg: Msg = {
      id: idRef.current++,
      role: "user",
      content: content || "(see attachment)",
      attachments: sending.map((a) => ({ type: a.type, name: a.name, preview: a.preview })),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setAttachments([]);
    setBusy(true);
    setStreamText("");

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        signal: abortController.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== 0)
            .map((m) => ({ role: m.role, content: m.content })),
          attachments: sending.map((a) => ({
            type: a.type, name: a.name, mime: a.mime,
            content: a.content, dataUrl: a.dataUrl,
          })),
          model: selectedModel || undefined,
          stream: true,
          chatId: currentChatId || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || "Request failed");
      }

      const contentType = res.headers.get("content-type") || "";
      const newChatId = res.headers.get("x-chat-id");
      if (newChatId && newChatId !== currentChatId) {
        setCurrentChatId(newChatId);
        fetchChats();
      }

      if (contentType.includes("text/plain")) {
        // Streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let full = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            full += chunk;
            setStreamText(full);
          }
        }

        setStreamText("");
        setMessages((prev) => [
          ...prev,
          {
            id: idRef.current++,
            role: "assistant",
            content: full || "No response received.",
            model: selectedModel || undefined,
          },
        ]);
      } else {
        // JSON response
        const data = await res.json();
        if (data.chatId && data.chatId !== currentChatId) {
          setCurrentChatId(data.chatId);
          fetchChats();
        }
        setMessages((prev) => [
          ...prev,
          {
            id: idRef.current++,
            role: "assistant",
            content: data.reply || data.error || "Something went wrong.",
            model: data.model || selectedModel || undefined,
          },
        ]);
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("Fetch aborted by user");
      } else {
        toastError("Agent unavailable", e instanceof Error ? e.message : "Try again.");
      }
    } finally {
      setBusy(false);
      setStreamText("");
      abortControllerRef.current = null;
    }
  }, [input, attachments, busy, messages, selectedModel, currentChatId, toastError]);

  /* ── Copy and reset ─────────────────────────────────────────── */
  const copy = (m: Msg) => {
    navigator.clipboard?.writeText(m.content);
    setCopied(m.id);
    setTimeout(() => setCopied(null), 1400);
  };

  const reset = () => {
    setCurrentChatId(null);
    setMessages([GREETING]);
    idRef.current = 1;
    setStreamText("");
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-[1000px] gap-6">
      {/* sidebar */}
      <div className="hidden w-64 flex-col border-r border-[var(--stroke)] pr-6 md:flex">
        <button
          onClick={reset}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 text-[13px] font-medium text-[var(--fg)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] shadow-sm"
        >
          <RotateCcw className="h-4 w-4" /> New chat
        </button>
        <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-4)]">Recent Chats</div>
        <div className="flex-1 space-y-1 overflow-y-auto pr-2">
          {chats.map(c => (
            <div key={c.id} className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-colors ${currentChatId === c.id ? "bg-[var(--panel-fill-2)] text-[var(--fg)] font-medium" : "text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg-2)]"}`}>
              {renamingChatId === c.id ? (
                <input
                  autoFocus
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  onBlur={() => saveRename(c.id, renameInput)}
                  onKeyDown={(e) => e.key === "Enter" && saveRename(c.id, renameInput)}
                  className="w-full bg-transparent outline-none"
                />
              ) : (
                <>
                  <button onClick={() => loadChat(c.id)} className="flex-1 truncate text-left flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 opacity-70" />
                    <span className="truncate">{c.title}</span>
                  </button>
                  <div className="opacity-0 transition-opacity group-hover:opacity-100 flex items-center">
                    <button onClick={(e) => { e.stopPropagation(); setRenamingChatId(c.id); setRenameInput(c.title); }} className="p-1 hover:bg-black/20 rounded">
                      <Edit2 className="h-3.5 w-3.5 text-[var(--fg-4)] hover:text-[var(--fg)]" />
                    </button>
                    <button onClick={(e) => deleteChat(c.id, e)} className="p-1 hover:bg-black/20 rounded">
                      <Trash2 className="h-3.5 w-3.5 text-[var(--fg-4)] hover:text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "color-mix(in srgb, var(--sai-indigo) 16%, transparent)" }}
          >
            <Sparkles className="h-5 w-5 text-[var(--sai-indigo)]" />
          </span>
          <div>
            <h1 className="font-display text-[17px] font-semibold text-[var(--fg)]">Create</h1>
            <p className="text-[12px] text-[var(--fg-3)]">Your personal Socially agent</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[12px] text-[var(--fg-2)] hover:bg-[var(--hover)]"
        >
          <RotateCcw className="h-3.5 w-3.5" /> New chat
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="glass-panel flex-1 overflow-y-auto rounded-2xl p-4 sm:p-5">
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-[var(--fg)]`}
                style={
                  m.role === "user"
                    ? { background: "linear-gradient(135deg,#6366f1,#a855f7)" }
                    : { background: "var(--panel-fill-2)", border: "1px solid var(--panel-fill-2)" }
                }
              >
                {/* Attachments */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {m.attachments.map((a, k) => (
                      <div key={k} className="overflow-hidden rounded-lg border border-[var(--stroke)] bg-black/20">
                        {a.type === "image" && a.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.preview} alt={a.name} className="h-20 w-20 object-cover" />
                        ) : (
                          <div className="flex h-20 w-20 flex-col items-center justify-center gap-1 px-1 text-center">
                            {a.type === "video" ? <Film className="h-5 w-5 text-[var(--fg-2)]" /> : <FileText className="h-5 w-5 text-[var(--fg-2)]" />}
                            <span className="line-clamp-2 text-[9px] text-[var(--fg-2)]">{a.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Content with basic markdown rendering */}
                <div className="w-full overflow-hidden">
                  <MarkdownRenderer content={m.content} />
                </div>

                {/* Model badge for AI responses */}
                {m.role === "assistant" && m.id !== 0 && m.model && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--fg-4)]">
                    <Bot className="h-2.5 w-2.5" />
                    {modelDisplayName(m.model, models)}
                  </div>
                )}

                {/* Copy button */}
                {m.role === "assistant" && m.id !== 0 && (
                  <button
                    onClick={() => copy(m)}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[#181820] text-[var(--fg-3)] opacity-0 transition-opacity hover:text-[var(--fg)] group-hover:opacity-100"
                    title="Copy"
                  >
                    {copied === m.id ? <Check className="h-3.5 w-3.5 text-[#34d399]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Streaming text */}
          {busy && streamText && (
            <div className="flex justify-start">
              <div
                className="relative max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-[var(--fg)]"
                style={{ background: "var(--panel-fill-2)", border: "1px solid var(--panel-fill-2)" }}
              >
                <div className="w-full overflow-hidden">
                  <MarkdownRenderer content={streamText} />
                </div>
                <span className="inline-block h-4 w-0.5 animate-pulse bg-[var(--sai-indigo)]" />
              </div>
            </div>
          )}

          {/* Typing indicator (no stream text yet) */}
          {busy && !streamText && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-3.5">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-[var(--fg-4)]">
                  {selectedModel
                    ? `${modelDisplayName(selectedModel, models)} is thinking…`
                    : "Thinking…"}
                </span>
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
              className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[12.5px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* composer */}
      <div className="mt-3">
        {/* attachment chips */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="group relative flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] py-1.5 pl-1.5 pr-2.5"
              >
                {a.type === "image" && a.preview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.preview} alt="" className="h-8 w-8 rounded-lg object-cover" />
                    {hasVision && (
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500" title="AI will analyze this image">
                        <Eye className="h-2 w-2 text-white" />
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--panel-fill-2)]">
                    {a.type === "video" ? <Film className="h-4 w-4 text-[var(--sai-violet)]" /> : <FileText className="h-4 w-4 text-[var(--sai-indigo)]" />}
                  </span>
                )}
                <span className="max-w-[120px] truncate text-[12px] text-[var(--fg-2)]">{a.name}</span>
                <button onClick={() => removeAttachment(a.id)} className="text-[var(--fg-4)] hover:text-[var(--sai-red)]">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Vision indicator */}
            {hasImageAttachments && hasVision && (
              <span className="flex items-center gap-1 self-center rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-400">
                <Eye className="h-3 w-3" /> AI will analyze images
              </span>
            )}
          </div>
        )}

        <div className="glass-panel flex items-end gap-2 rounded-2xl p-2">
          {/* File attach */}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,.txt,.md,.csv,.json,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            title="Attach image, video, or file"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Tooling picker */}
          <div className="relative" ref={toolPickerRef}>
            <button
              onClick={() => { setShowToolPicker(!showToolPicker); setShowModelPicker(false); }}
              title="Agent Tools"
              className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 text-[11px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#10b981]" />
              <span className="max-w-[100px] truncate hidden sm:inline-block">Tools</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showToolPicker && (
              <div
                className="absolute bottom-full left-0 z-50 mb-2 w-[220px] overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl"
                style={{ backdropFilter: "blur(20px)" }}
              >
                <div className="border-b border-[var(--stroke)] p-3">
                  <p className="text-[12px] font-semibold text-[var(--fg)]">Agent Tools</p>
                  <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">Force the AI to act</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1.5">
                  {AGENT_TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        const prompt = `Please use your ${tool.id} tool to ${tool.promptSuffix}`;
                        if (tool.needsParams) {
                          setInput((prev) => prev ? prev + "\n" + prompt : prompt);
                          setTimeout(() => textareaRef.current?.focus(), 10);
                        } else {
                          send(prompt);
                        }
                        setShowToolPicker(false);
                      }}
                      className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--hover)]"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[12px] font-medium text-[var(--fg)] block group-hover:text-[var(--sai-indigo)] transition-colors">{tool.name}</span>
                        <span className="text-[10px] text-[var(--fg-4)] block truncate">{tool.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Model picker */}
          <div className="relative" ref={modelPickerRef}>
            <button
              onClick={() => { setShowModelPicker(!showModelPicker); setShowToolPicker(false); }}
              title="Select AI model"
              className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 text-[11px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <Bot className="h-3.5 w-3.5 text-[var(--sai-indigo)]" />
              <span className="max-w-[100px] truncate">
                {selectedModel ? modelDisplayName(selectedModel, models) : "Model"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showModelPicker && (
              <div
                className="absolute bottom-full left-0 z-50 mb-2 w-[280px] overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl"
                style={{ backdropFilter: "blur(20px)" }}
              >
                <div className="border-b border-[var(--stroke)] p-3">
                  <p className="text-[12px] font-semibold text-[var(--fg)]">Select Model</p>
                  <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">Powered by OpenRouter</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1.5">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelPicker(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--hover)]"
                      style={selectedModel === model.id ? { background: "rgba(99,102,241,0.12)" } : undefined}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-medium text-[var(--fg)]">{model.name}</span>
                          {model.supportsVision && <Eye className="h-2.5 w-2.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-[var(--fg-4)]">{model.provider}</span>
                      </div>
                      {selectedModel === model.id && (
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-[var(--sai-indigo)]" />
                      )}
                    </button>
                  ))}
                  {models.length === 0 && (
                    <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-[var(--fg-3)]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Text input */}
          <textarea
            ref={textareaRef}
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
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:outline-none"
          />

          {/* Send / Stop button */}
          {busy ? (
            <button
              onClick={stopGeneration}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-red-500 transition-transform hover:scale-105"
              title="Stop generating"
            >
              <div className="h-3.5 w-3.5 rounded-[2px] bg-current" />
            </button>
          ) : (
            <button
              onClick={() => send()}
              disabled={(!input.trim() && attachments.length === 0)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[var(--fg)] transition-transform hover:scale-105 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          )}
        </div>

        <p className="mt-2 text-center text-[11px] text-[var(--fg-4)]">
          Socially can draft and refine — always review before you post.
        </p>
        </div>
      </div>
    </div>
  );
}
