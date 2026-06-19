"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PLATFORM_COLORS: Record<string, string> = {
  x:         "bg-sky-500/20 text-sky-400",
  linkedin:  "bg-blue-500/20 text-blue-400",
  instagram: "bg-rose-500/20 text-rose-400",
  tiktok:    "bg-violet-500/20 text-violet-400",
  threads:   "bg-muted text-muted-foreground",
  youtube:   "bg-red-500/20 text-red-400",
};

export interface ScheduledPostSlim {
  id: string;
  platform: string;
  content: string;
  scheduled_at: string;
  status: string;
}

interface CalendarClientProps {
  posts: ScheduledPostSlim[];
}

export function CalendarClient({ posts }: CalendarClientProps) {
  const now  = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDay    = new Date(view.year, view.month, 1).getDay();
  const cells       = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const today = now.getMonth() === view.month && now.getFullYear() === view.year
    ? now.getDate()
    : -1;

  /* Group posts by day number in current view */
  const postsByDay: Record<number, ScheduledPostSlim[]> = {};
  posts.forEach(p => {
    const d = new Date(p.scheduled_at);
    if (d.getFullYear() === view.year && d.getMonth() === view.month) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(p);
    }
  });

  const platformColor = (platform: string) =>
    PLATFORM_COLORS[platform.toLowerCase()] ?? "bg-muted text-muted-foreground";

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-foreground" />
            Content Calendar
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Visual overview of your scheduled content
          </p>
        </div>
        <Button variant="gradient" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule post
        </Button>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView(v => ({ ...v, month: v.month - 1 }))}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="font-semibold text-lg">{MONTH_NAMES[view.month]} {view.year}</h2>
          <button
            onClick={() => setView(v => ({ ...v, month: v.month + 1 }))}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="h-20 sm:h-24" />;
            const dayPosts = postsByDay[day] ?? [];
            const isToday  = day === today;

            return (
              <div
                key={i}
                className={cn(
                  "h-20 sm:h-24 rounded-lg p-1.5 border transition-colors cursor-pointer",
                  isToday
                    ? "border-red-500/50 bg-red-500/5"
                    : dayPosts.length > 0
                    ? "border-border hover:border-white/15 bg-card hover:bg-muted/30"
                    : "border-transparent hover:border-border hover:bg-accent/30"
                )}
              >
                {/* Date number */}
                <div className={cn("text-xs font-medium mb-1", isToday ? "text-red-400" : "text-muted-foreground")}>
                  {isToday ? (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
                      {day}
                    </span>
                  ) : day}
                </div>

                {/* Post pills */}
                <div className="space-y-0.5 overflow-hidden">
                  {dayPosts.slice(0, 2).map((post, j) => (
                    <div
                      key={j}
                      className={cn(
                        "flex items-center gap-1 text-[10px] rounded px-1 py-0.5 truncate",
                        platformColor(post.platform)
                      )}
                    >
                      <Clock className="w-2 h-2 flex-shrink-0" />
                      <span className="truncate">{formatTime(post.scheduled_at)}</span>
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-[10px] text-muted-foreground px-1">+{dayPosts.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
