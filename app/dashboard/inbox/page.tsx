"use client";

import { useState } from "react";
import { MessageSquare, UserCheck, AlertCircle, Smile, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "leads",      label: "Leads",      count: 4,   icon: UserCheck,   color: "text-red-400",          bg: "bg-red-500/10" },
  { id: "complaints", label: "Complaints", count: 1,   icon: AlertCircle, color: "text-red-500",           bg: "bg-red-600/10" },
  { id: "fluff",      label: "Fluff",      count: 95,  icon: Smile,       color: "text-muted-foreground",  bg: "bg-muted"      },
  { id: "all",        label: "All",        count: 100, icon: MessageSquare,color: "text-red-400",           bg: "bg-red-500/10" },
];

const MESSAGES = [
  { id: 1, category: "leads",      author: "Amara Nwosu",  platform: "LinkedIn", time: "5m",  content: "How much does your Pro plan cost? I'm running an agency and this looks perfect for client management.", avatar: "AN", read: false },
  { id: 2, category: "leads",      author: "Oke Fashola",  platform: "X",        time: "12m", content: "Is this available for WhatsApp channels too? Would love to use it for my brand", avatar: "OF", read: false },
  { id: 3, category: "complaints", author: "Chisom Ejike", platform: "Instagram", time: "34m", content: "My account got disconnected and I can't reconnect it. The button just spins. This is affecting my scheduled posts!", avatar: "CE", read: false },
  { id: 4, category: "leads",      author: "Bello Yakubu", platform: "LinkedIn", time: "1h",  content: "Do you offer white-label solutions? I want to resell this to my clients", avatar: "BY", read: true  },
  { id: 5, category: "fluff",      author: "Funmi Ade",    platform: "Instagram", time: "1h",  content: "🔥🔥🔥 This is amazing!", avatar: "FA", read: true  },
  { id: 6, category: "leads",      author: "Emeka Obi",    platform: "X",        time: "2h",  content: "How does the AI sound like me? Is there a demo? I've been looking for something like this for months", avatar: "EO", read: true  },
  { id: 7, category: "fluff",      author: "Titi Ogundimu",platform: "X",        time: "2h",  content: "So helpful, thank you! 👏", avatar: "TO", read: true  },
];

export default function InboxPage() {
  const [activeCategory, setActiveCategory] = useState("leads");
  const [selectedMsg,    setSelectedMsg]    = useState<number | null>(1);
  const [reply,          setReply]          = useState("");

  const filtered  = MESSAGES.filter((m) => activeCategory === "all" || m.category === activeCategory);
  const selected  = MESSAGES.find((m) => m.id === selectedMsg);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-red-400" />
          Smart Inbox
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          AI-triaged messages sorted by intent — leads first, fluff last
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        {/* Left: category + list */}
        <div className="flex flex-col gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  activeCategory === cat.id
                    ? "border-red-500/50 bg-red-500/10 text-red-400"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                {cat.label}
                <span className="ml-0.5 text-xs opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMsg(msg.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  selectedMsg === msg.id
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-border hover:border-border/80 hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold flex-shrink-0 text-red-400">
                    {msg.avatar}
                  </div>
                  <span className="text-sm font-medium truncate flex-1">{msg.author}</span>
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                  <span className="text-xs text-muted-foreground flex-shrink-0">{msg.time}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{msg.content}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="red" className="text-xs">{msg.category}</Badge>
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
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-sm font-bold text-red-400">
                {selected.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium">{selected.author}</p>
                <p className="text-xs text-muted-foreground">{selected.platform} · {selected.time}</p>
              </div>
              <Badge variant="red">{selected.category}</Badge>
            </div>

            {/* Message */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-lg">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm leading-relaxed">{selected.content}</p>
                </div>

                {selected.category === "leads" && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <p className="text-xs font-medium text-red-400 mb-2">🎯 AI Suggested Reply</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Hi {selected.author.split(" ")[0]}! Thanks for reaching out 🙌{" "}
                      {selected.platform === "LinkedIn"
                        ? "Our Pro plan starts at ₦12,000/month and covers 7 accounts — perfect for agency use. I'll DM you a full breakdown."
                        : "Absolutely! WhatsApp Channels integration is on our roadmap for Q3 2026. You can join the waitlist at sociallyai.co/waitlist"}
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
