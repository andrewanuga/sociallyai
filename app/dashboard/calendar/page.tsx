"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, LayoutGrid, ChevronLeft, ChevronRight, Plus, Camera, AtSign, Building2, Layout, Sparkles } from "lucide-react";
import { PageHeader, GlassCard, Pill, PrimaryButton } from "@/components/dashboard/ui";

const MOCK_SCHEDULE = [
  { id: 1, day: 2, time: "09:00 AM", platform: "Instagram", type: "Reel", title: "Behind the Scenes at Agency" },
  { id: 2, day: 2, time: "02:30 PM", platform: "X", type: "Thread", title: "Outbound Strategy Breakdown" },
  { id: 3, day: 4, time: "11:00 AM", platform: "LinkedIn", type: "Carousel", title: "5 AI Prompts for Sales" },
  { id: 4, day: 5, time: "10:00 AM", platform: "Instagram", type: "Post", title: "Client Testimonial" },
];

export default function CalendarPage() {
  const [view, setView] = useState<"calendar" | "grid">("calendar");
  const daysInMonth = 30; // Mock month length

  return (
    <div className="mx-auto max-w-6xl pb-12 h-[calc(100vh-100px)] flex flex-col">
      <PageHeader 
        eyebrow="Publishing" 
        title="Visual Grid Planner" 
        sub="Drag and drop your content calendar. Switch to Grid View to preview exactly how your Instagram profile will look."
        actions={
          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-[var(--panel-fill-2)] p-1 rounded-full border border-[var(--stroke)]">
              <button 
                onClick={() => setView("calendar")}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${view === "calendar" ? "bg-[var(--panel-fill)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Calendar
              </button>
              <button 
                onClick={() => setView("grid")}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${view === "grid" ? "bg-[var(--panel-fill)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> IG Grid
              </button>
            </div>
            <PrimaryButton className="h-9 px-4">
              <Plus className="w-4 h-4 mr-1" /> New Post
            </PrimaryButton>
          </div>
        }
      />

      <GlassCard className="flex-1 flex flex-col overflow-hidden border-[var(--stroke)] mt-2">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--stroke)] bg-[var(--panel-fill-2)]/50">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-[18px] font-semibold text-[var(--fg)]">August 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1 text-[12px] font-medium text-[var(--fg-2)] hover:text-[var(--fg)]">Today</button>
              <button className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-medium text-[var(--fg-4)]">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#E1306C]" /> Instagram</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1DA1F2]" /> X</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#0A66C2]" /> LinkedIn</span>
          </div>
        </div>

        {view === "calendar" ? (
          <div className="flex-1 overflow-auto bg-[var(--app-surface)]">
            <div className="grid grid-cols-7 border-b border-[var(--stroke)] sticky top-0 bg-[var(--app-surface)] z-10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 h-full">
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i - 4; // Offset to start month on Friday
                const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                const scheduledEvents = MOCK_SCHEDULE.filter(s => s.day === dayNum);

                return (
                  <div key={i} className={`border-r border-b border-[var(--stroke)] min-h-[120px] p-2 transition-colors ${isCurrentMonth ? 'bg-[var(--panel-fill)]/50 hover:bg-[var(--panel-fill)]' : 'bg-[var(--app-bg)]/50 opacity-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full ${dayNum === 2 ? 'bg-[var(--sai-indigo)] text-white' : 'text-[var(--fg-3)]'}`}>
                        {isCurrentMonth ? dayNum : ''}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {scheduledEvents.map(event => (
                        <div key={event.id} className="cursor-pointer group flex items-center gap-1.5 p-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--app-surface)] hover:border-[var(--sai-indigo)]/50 hover:shadow-sm transition-all">
                          {event.platform === "Instagram" && <Camera className="w-3 h-3 text-[#E1306C] flex-shrink-0" />}
                          {event.platform === "X" && <AtSign className="w-3 h-3 text-[#1DA1F2] flex-shrink-0" />}
                          {event.platform === "LinkedIn" && <Building2 className="w-3 h-3 text-[#0A66C2] flex-shrink-0" />}
                          <span className="text-[10px] font-medium text-[var(--fg-2)] truncate group-hover:text-[var(--fg)]">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-[var(--app-surface)] flex items-center justify-center p-8">
            <div className="w-full max-w-[350px] bg-[var(--panel-fill)] border border-[var(--stroke)] rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[700px]">
              <div className="h-12 border-b border-[var(--stroke)] flex items-center justify-between px-6">
                <span className="text-[14px] font-bold text-[var(--fg)]">@sociallyai_hq</span>
                <Layout className="w-4 h-4 text-[var(--fg-3)]" />
              </div>
              <div className="p-4 border-b border-[var(--stroke)] flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sai-indigo)] to-[var(--sai-violet)] flex items-center justify-center border-2 border-[var(--app-surface)]">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex gap-4 mb-1">
                    <div className="text-center"><p className="text-[14px] font-bold text-[var(--fg)]">124</p><p className="text-[11px] text-[var(--fg-4)]">Posts</p></div>
                    <div className="text-center"><p className="text-[14px] font-bold text-[var(--fg)]">12.5K</p><p className="text-[11px] text-[var(--fg-4)]">Followers</p></div>
                    <div className="text-center"><p className="text-[14px] font-bold text-[var(--fg)]">45</p><p className="text-[11px] text-[var(--fg-4)]">Following</p></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-[var(--app-bg)] overflow-y-auto hide-scrollbar">
                <div className="grid grid-cols-3 gap-0.5">
                  {/* Mock Grid Posts */}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className={`aspect-square relative cursor-grab active:cursor-grabbing ${i < 2 ? 'bg-gradient-to-br from-[var(--sai-indigo)]/20 to-[var(--sai-violet)]/20 border-2 border-[var(--sai-indigo)]' : 'bg-[var(--panel-fill-2)]'}`}>
                      {i < 2 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Pill tone="indigo" className="scale-75 shadow-lg backdrop-blur-md bg-[var(--sai-indigo)]/80 text-white border-white/20">Scheduled</Pill>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
