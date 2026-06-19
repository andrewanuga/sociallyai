"use client";

import { useState } from "react";
import { Ghost, Bot, AlertCircle, UserCheck, Settings2, Pause, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AgentActionRow } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/dashboard/helpers";

const ACTION_META = {
  auto_reply:         { icon: Bot,         color: "text-green-400", bg: "bg-green-500/10", label: "Auto-replied"  },
  flag_lead:          { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", label: "Lead detected" },
  escalate_complaint: { icon: AlertCircle, color: "text-red-500",   bg: "bg-red-600/10",   label: "Escalated"    },
  ignore:             { icon: Bot,         color: "text-muted-foreground", bg: "bg-muted", label: "Ignored"       },
} as const;

const DEFAULT_RULES = [
  { label: "Auto-reply to compliments & emojis",  enabled: true  },
  { label: "Flag comments asking about prices",    enabled: true  },
  { label: "Escalate customer complaints",         enabled: true  },
  { label: "Auto-reply to 'great post' variants",  enabled: true  },
  { label: "Detect & flag potential leads",         enabled: true  },
  { label: "Ignore spam comments",                  enabled: false },
];

interface GhostModeClientProps {
  initialActions: AgentActionRow[];
  statsToday:     { autoReplies: number; leads: number; hoursSaved: number };
  initiallyActive: boolean;
}

export function GhostModeClient({ initialActions, statsToday, initiallyActive }: GhostModeClientProps) {
  const [agentActive, setAgentActive] = useState(initiallyActive);
  const [rules, setRules] = useState(DEFAULT_RULES);

  const toggleRule = (i: number) =>
    setRules(prev => prev.map((r, j) => (i === j ? { ...r, enabled: !r.enabled } : r)));

  const stats = [
    { label: "Auto-replies sent (today)", value: statsToday.autoReplies.toString(), color: "text-green-400"   },
    { label: "Leads flagged (today)",     value: statsToday.leads.toString(),        color: "text-amber-400"   },
    { label: "Hours saved this week",     value: `${statsToday.hoursSaved}h`,        color: "text-emerald-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ghost className="w-6 h-6 text-red-400" />
            Ghost Mode™
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your autonomous AI engagement agent. It handles the noise — you handle the signal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="red" className="gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", agentActive ? "bg-green-400 animate-pulse" : "bg-muted-foreground")} />
            {agentActive ? "Agent Active" : "Agent Paused"}
          </Badge>
          <Button
            variant={agentActive ? "outline" : "gradient"}
            size="sm"
            className="gap-2"
            onClick={() => setAgentActive(!agentActive)}
          >
            {agentActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {agentActive ? "Pause Agent" : "Activate Agent"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card text-center">
            <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Action log */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4">Live Agent Log</h3>
          {initialActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ghost className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No agent actions yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Connect your social accounts and activate the agent to see activity here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialActions.map((action) => {
                const meta = ACTION_META[action.action as keyof typeof ACTION_META] ?? ACTION_META.ignore;
                const Icon = meta.icon;
                return (
                  <div key={action.id} className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                          {action.platform && (
                            <span className="text-xs text-muted-foreground">{action.platform}</span>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">{timeAgo(action.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic mb-1">
                          &ldquo;{action.comment}&rdquo;
                        </p>
                        {action.reply && (
                          <p className="text-sm text-foreground bg-green-500/5 border border-green-500/10 rounded-md px-3 py-1.5">
                            → {action.reply}
                          </p>
                        )}
                        {!action.reply && action.action !== "ignore" && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="gradient" className="h-7 text-xs px-3">Reply now</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs px-3">Dismiss</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="space-y-4">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Agent Rules</h3>
            </div>
            <div className="space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground flex-1">{rule.label}</p>
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(i)} />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-medium">Pro tip</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Set an Auto-Plug trigger: when a post hits 50+ engagements, the agent automatically drops your product link in a reply.
            </p>
            <Button size="sm" variant="outline" className="w-full mt-3 text-xs h-7">
              Configure Auto-Plug
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
