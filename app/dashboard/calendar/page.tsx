"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// All posts use red brand colour — no per-platform colours
const SCHEDULED_POSTS: Record<number, { time: string; platform: string; content: string }[]> = {
  3:  [{ time: "8:00am",  platform: "X",         content: "5 mistakes founders make... 🧵"                }],
  7:  [{ time: "7:30am",  platform: "LinkedIn",   content: "Why self-hosting AI beats GPT-4 for startups"  },
       { time: "6:00pm",  platform: "Instagram",  content: "Day in the life content 📸"                    }],
  12: [{ time: "8:00am",  platform: "X",         content: "Trend thread: AI regulation in Africa"          }],
  15: [{ time: "12:00pm", platform: "LinkedIn",   content: "Case study: ₦2.4M from social posts"           }],
  19: [{ time: "7:00am",  platform: "X",         content: "Weekly growth tips thread"                      }],
  22: [{ time: "9:00am",  platform: "LinkedIn",   content: "Naira SaaS pricing breakdown"                  },
       { time: "3:00pm",  platform: "TikTok",     content: "Behind the scenes video"                       }],
  26: [{ time: "8:30am",  platform: "Instagram",  content: "Creator economy insights"                      }],
  28: [{ time: "7:00am",  platform: "X",         content: "Auto-Plug announcement thread"                  }],
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 4 }); // May 2026
  const today = 28;

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDay    = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const cells       = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-red-400" />
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
        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth((p) => ({ ...p, month: p.month - 1 }))}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="font-semibold text-lg">
            {monthNames[currentMonth.month]} {currentMonth.year}
          </h2>
          <button
            onClick={() => setCurrentMonth((p) => ({ ...p, month: p.month + 1 }))}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="h-20 sm:h-24" />;

            const posts   = SCHEDULED_POSTS[day] || [];
            const isToday = day === today;

            return (
              <div
                key={i}
                className={cn(
                  "h-20 sm:h-24 rounded-lg p-1.5 border transition-colors cursor-pointer",
                  isToday
                    ? "border-red-500/50 bg-red-500/5"
                    : posts.length > 0
                    ? "border-border hover:border-red-500/20 bg-card hover:bg-muted/30"
                    : "border-transparent hover:border-border hover:bg-accent/30"
                )}
              >
                <div className={cn("text-xs font-medium mb-1", isToday ? "text-red-400" : "text-muted-foreground")}>
                  {isToday ? (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
                      {day}
                    </span>
                  ) : day}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {posts.slice(0, 2).map((post, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-1 text-[10px] rounded px-1 py-0.5 truncate bg-red-500/15 text-red-400"
                    >
                      <Clock className="w-2 h-2 flex-shrink-0" />
                      <span className="truncate">{post.time}</span>
                    </div>
                  ))}
                  {posts.length > 2 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{posts.length - 2} more
                    </div>
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
