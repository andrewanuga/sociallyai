"use client";

import { useState } from "react";
import { MessageSquare, UserCheck, AlertCircle, Smile, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { InboxMessage, InboxCategory } from "@/lib/supabase/types";

const CATEGORY_META: Record<InboxCategory | "all", { label: string; icon: typeof MessageSquare; color: string; bg: string }> = {
  leads:      { label: "Leads",      icon: UserCheck,    color: "text-amber-400",        bg: "bg-amber-500/10" },
  complaints: { label: "Complaints", icon: AlertCircle,  color: "text-red-500",          bg: "bg-red-600/10"   },
  fluff:      { label: "Fluff",      icon: Smile,        color: "text-muted-foreground", bg: "bg-muted"        },
  all:        { label: "All",        icon: MessageSquare,color: "text-foreground",        bg: "bg-muted"        },
};

interface InboxClientProps {
  messages: InboxMessage[];
}

export function InboxClient({ messages }: InboxClientProps) {
  const [activeCategory, setActiveCategory] = useState<InboxCategory | "all">("leads");
  const [selectedId, setSelectedId]         = useState<string | null>(messages[0]?.id ?? null);
  const [reply, setReply]                   = useState("");

  const filtered = activeCategory === "all"
    ? messages
    : messages.filter(m => m.category === activeCategory);

  const selected = messages.find(m => m.id === selectedId);

  const counts = {
    leads:      messages.filter(m => m.category === "leads").length,
    complaints: messages.filter(m => m.category === "complaints").length,
    fluff:      messages.filter(m => m.category === "fluff").length,
    all:        messages.length,
  };

  const initials = (name: string | null) =>
    (name ?? "?").split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);

  const categoryBadgeVariant = (cat: InboxCategory): "red" | "secondary" => {
    if (cat === "complaints") return "red";
    return "secondary";
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-foreground" />
          Smart Inbox
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          AI-triaged messages sorted by intent — leads first, fluff last
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        {/* Left: category tabs + message list */}
        <div className="flex flex-col gap-4">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {(["leads", "complaints", "fluff", "all"] as const).map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    activeCategory === cat
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <meta.icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  {meta.label}
                  <span className="ml-0.5 text-xs opacity-70">({counts[cat]})</span>
                </button>
              );
            })}
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No messages in this category</p>
              </div>
            ) : filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedId(msg.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  selectedId === msg.id
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-border hover:border-border/80 hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0 text-foreground">
                    {initials(msg.author_name)}
                  </div>
                  <span className="text-sm font-medium truncate flex-1">{msg.author_name ?? "Unknown"}</span>
                  {!msg.is_read && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(msg.received_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={categoryBadgeVariant(msg.category)} className="text-xs">{msg.category}</Badge>
                  <span className="text-xs text-muted-foreground">{msg.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: message thread */}
        {selected ? (
          <div className="lg:col-span-2 flex flex-col border border-border rounded-xl bg-card overflow-hidden">
            {/* Thread header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                {initials(selected.author_name)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{selected.author_name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.platform} · {new Date(selected.received_at).toLocaleString()}
                </p>
              </div>
              <Badge variant={categoryBadgeVariant(selected.category)}>{selected.category}</Badge>
            </div>

            {/* Message content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-lg">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm leading-relaxed">{selected.message}</p>
                </div>

                {selected.category === "leads" && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <p className="text-xs font-medium text-amber-400 mb-2">🎯 AI Suggested Reply</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Hi {selected.author_name?.split(" ")[0]}! Thanks for reaching out 🙌{" "}
                      {selected.reply_content
                        ? selected.reply_content
                        : "I'd love to tell you more — let me send you a quick overview."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reply box */}
            <div className="p-4 border-t border-border">
              <Textarea
                placeholder="Write a reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="min-h-[80px] resize-none mb-3"
              />
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  Use AI suggestion
                </Button>
                <Button variant="gradient" size="sm" className="gap-2">
                  Send reply
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 border border-dashed border-border rounded-xl bg-card/50 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Select a message to reply</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
