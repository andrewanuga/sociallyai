"use client";

import { useState } from "react";
import { Link2, Sparkles, Send, AtSign, Building2, Camera, LayoutTemplate, Layers } from "lucide-react";
import { PageHeader, GlassCard, PrimaryButton } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import { MarkdownRenderer } from "@/components/dashboard/MarkdownRenderer";

export default function CampaignBuilderPage() {
  const { error, success } = useToast();
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaign, setCampaign] = useState<{
    twitter: string[];
    linkedin: string;
    instagram: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!url && !topic) {
      error("Input required", "Please provide a URL or a topic to generate a campaign.");
      return;
    }

    setIsGenerating(true);
    // Simulating API call for now. I will build the real API next.
    setTimeout(() => {
      setCampaign({
        twitter: [
          "1/ We just completely transformed how you do outbound marketing. Say goodbye to spreadsheets. Say hello to Socially AI's Omnichannel CRM.",
          "2/ Our new AI Intent Scoring automatically detects Hot Leads from your DMs across X, IG, and LinkedIn. It flags them with a 🔥 so your sales team knows exactly who to close.",
          "3/ Ready to scale your agency without scaling your headcount? Try Socially AI today."
        ],
        linkedin: "Outbound marketing is broken. Agencies spend hours scraping leads, sending generic DMs, and praying for replies.\n\nWe fixed it.\n\nIntroducing the Socially AI Smart CRM:\n🔥 AI Intent Scoring\n💬 Real-time Team Inbox (No more double replies!)\n⚡ Automated Drip Engines\n\nStop paying $500/mo for HubSpot just to track your Twitter DMs. Unify your entire pipeline in one beautifully designed glass dashboard. Check out the launch video below 👇",
        instagram: "The future of Agency growth is here. 🚀 Our new Omnichannel CRM brings all your X, LinkedIn, and IG leads into one beautiful Kanban board. Complete with AI Intent Scoring so you never miss a hot lead again. Link in bio to start your free trial. 📈 #marketing #agency #ai"
      });
      setIsGenerating(false);
      success("Campaign Generated", "Cross-platform assets are ready for review.");
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <PageHeader 
        eyebrow="Agentic Workspace" 
        title="Campaign Builder" 
        sub="Paste a URL or topic. Our AI orchestration engine will research the context and generate a cohesive, cross-platform campaign in seconds."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Column */}
        <div className="col-span-1 flex flex-col gap-5">
          <GlassCard className="p-6">
            <h3 className="font-display text-[16px] font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--sai-indigo)]" />
              Source Material
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--fg-4)] mb-1.5 block">Source URL (Blog, YouTube, Product)</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-4)]" />
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..." 
                    className="w-full bg-[var(--panel-fill)] border border-[var(--stroke)] rounded-xl h-10 pl-9 pr-3 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--sai-indigo)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--fg-4)] mb-1.5 block">Or describe the topic</label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="We are launching a new feature that does..." 
                  className="w-full bg-[var(--panel-fill)] border border-[var(--stroke)] rounded-xl p-3 text-sm text-[var(--fg)] min-h-[100px] resize-none focus:outline-none focus:border-[var(--sai-indigo)]"
                />
              </div>

              <PrimaryButton onClick={handleGenerate} disabled={isGenerating} className="w-full justify-center mt-2">
                {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? "Orchestrating..." : "Generate Campaign"}
              </PrimaryButton>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-[var(--sai-indigo)]/5 border-[var(--sai-indigo)]/20">
            <h3 className="font-display text-[14px] font-semibold text-[var(--sai-indigo)] mb-2 flex items-center gap-1.5">
              <LayoutTemplate className="w-4 h-4" /> Pro Tip
            </h3>
            <p className="text-[13px] text-[var(--fg-2)] leading-relaxed">
              The Agentic Builder uses RAG to pull in your brand's specific tone of voice and historical high-performing posts to ensure the output doesn't sound like generic AI.
            </p>
          </GlassCard>
        </div>

        {/* Output Column */}
        <div className="col-span-1 lg:col-span-2">
          {!campaign ? (
            <div className="h-full min-h-[400px] border-2 border-dashed border-[var(--stroke)] rounded-2xl flex flex-col items-center justify-center text-center p-8">
              <Sparkles className="w-10 h-10 text-[var(--fg-4)] mb-4" />
              <p className="text-[16px] font-medium text-[var(--fg-2)]">Awaiting Instructions</p>
              <p className="text-[13px] text-[var(--fg-4)] max-w-sm mt-1">Provide source material on the left to see the AI generate a synchronized cross-platform campaign.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* X Thread */}
              <GlassCard className="p-6 border-[var(--stroke)] hover:border-[#1DA1F2]/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-[var(--fg)] flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-[#1DA1F2]" /> X (Twitter) Thread
                  </h3>
                  <button className="text-[12px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] flex items-center gap-1 bg-[var(--panel-fill-2)] px-3 py-1 rounded-full">
                    <Send className="w-3 h-3" /> Schedule
                  </button>
                </div>
                <div className="space-y-3">
                  {campaign.twitter.map((tweet, i) => (
                    <div key={i} className="bg-[var(--panel-fill)] p-4 rounded-xl border border-[var(--stroke)] relative">
                      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[var(--stroke)] -z-10 hidden" />
                      <div className="w-full overflow-hidden">
                        <MarkdownRenderer content={tweet} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* LinkedIn */}
              <GlassCard className="p-6 border-[var(--stroke)] hover:border-[#0A66C2]/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-[var(--fg)] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0A66C2]" /> LinkedIn Post
                  </h3>
                  <button className="text-[12px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] flex items-center gap-1 bg-[var(--panel-fill-2)] px-3 py-1 rounded-full">
                    <Send className="w-3 h-3" /> Schedule
                  </button>
                </div>
                <div className="bg-[var(--panel-fill)] p-4 rounded-xl border border-[var(--stroke)]">
                  <div className="w-full overflow-hidden">
                    <MarkdownRenderer content={campaign.linkedin} />
                  </div>
                </div>
              </GlassCard>

              {/* Instagram */}
              <GlassCard className="p-6 border-[var(--stroke)] hover:border-[#E1306C]/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-[var(--fg)] flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#E1306C]" /> Instagram Caption
                  </h3>
                  <button className="text-[12px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] flex items-center gap-1 bg-[var(--panel-fill-2)] px-3 py-1 rounded-full">
                    <Send className="w-3 h-3" /> Schedule
                  </button>
                </div>
                <div className="bg-[var(--panel-fill)] p-4 rounded-xl border border-[var(--stroke)]">
                  <div className="w-full overflow-hidden">
                    <MarkdownRenderer content={campaign.instagram} />
                  </div>
                </div>
              </GlassCard>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
