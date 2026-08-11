"use client";

import { useState } from "react";
import { Flame, Search, TrendingUp, Filter, Sparkles, MessageSquare, Repeat2, Heart, ExternalLink } from "lucide-react";
import { PageHeader, GlassCard, Pill, PrimaryButton } from "@/components/dashboard/ui";

const VIRAL_POSTS = [
  {
    id: "1",
    author: "Andrew Anuga",
    handle: "@andrewanuga",
    platform: "X",
    content: "If you want to grow an agency in 2026, stop hiring more SDRs.\n\nHire one AI Agent.\n\nOur new AI closed 4 deals this week while I was sleeping. The ROI is infinite.",
    likes: "14.2K",
    retweets: "3.1K",
    comments: "452",
    topic: "AI Agents",
    viralScore: 98
  },
  {
    id: "2",
    author: "Sarah Design",
    handle: "@sarahdesigns",
    platform: "LinkedIn",
    content: "Design subscriptions are dead.\n\nClients don't want a 'subscription'. They want an autonomous design partner.\n\nHere is how we completely overhauled our agency pricing model to charge 3x more while doing 50% less manual work: 👇",
    likes: "8,921",
    retweets: "1,204",
    comments: "892",
    topic: "Agency Pricing",
    viralScore: 94
  },
  {
    id: "3",
    author: "Marketing Max",
    handle: "@marketingmax",
    platform: "Instagram",
    content: "The algorithm didn't change. Your content just got boring.\n\nStop posting generic ChatGPT text. Start using RAG (Retrieval-Augmented Generation) to train AI on your actual brand voice.\n\n(Link in bio for the exact tool we use)",
    likes: "22.5K",
    retweets: "4.5K",
    comments: "1.2K",
    topic: "Content Strategy",
    viralScore: 99
  }
];

export default function TrendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredPosts = VIRAL_POSTS.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <PageHeader 
        eyebrow="Market Intelligence" 
        title="Viral Inspiration Hub" 
        sub="Cure writer's block. Spy on the top performing posts in your niche and rewrite them in your brand's unique voice."
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topics (e.g., AI, Agency)..."
                className="h-9 w-64 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] pl-9 pr-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)] focus:outline-none"
              />
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="flex gap-4 mb-8 border-b border-[var(--stroke)] pb-4">
        {["all", "x", "linkedin", "instagram"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${activeTab === tab ? "bg-[var(--panel-fill)] border border-[var(--stroke)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
          >
            {tab === "all" ? "Top 1% Viral" : tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => (
          <GlassCard key={post.id} className="p-5 flex flex-col justify-between group hover:border-[var(--sai-indigo)]/30 transition-colors">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--sai-indigo)] to-[var(--sai-violet)] flex items-center justify-center text-white font-bold text-[10px]">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] text-[var(--fg)]">{post.author}</p>
                    <p className="text-[11px] text-[var(--fg-4)]">{post.handle} • {post.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[var(--sai-red)]/10 px-2 py-0.5 rounded-full border border-[var(--sai-red)]/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                  <Flame className="w-3 h-3 text-[var(--sai-red)]" />
                  <span className="text-[10px] font-bold text-[var(--sai-red)]">{post.viralScore}</span>
                </div>
              </div>

              <div className="bg-[var(--panel-fill-2)] rounded-xl p-4 mb-4">
                <p className="text-[13px] text-[var(--fg)] whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 text-[var(--fg-4)] text-[12px] font-medium mb-4">
                <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {post.likes}</div>
                <div className="flex items-center gap-1.5"><Repeat2 className="w-3.5 h-3.5" /> {post.retweets}</div>
                <div className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {post.comments}</div>
              </div>

              <div className="flex items-center gap-2">
                <PrimaryButton className="flex-1 justify-center text-[12px] h-9">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Rewrite in My Voice
                </PrimaryButton>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
