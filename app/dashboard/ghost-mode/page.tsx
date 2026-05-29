"use client";

import { useState } from "react";
import { Ghost, Bot, AlertCircle, UserCheck, Settings2, Play, Pause, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AGENT_ACTIONS = [
  { id: 1, type: "auto-reply", comment: '"Wow this is such good content! 🙌"',                      reply: "Thank you! Glad it resonated — follow for more like this 🚀",  platform: "X",        time: "2m",  icon: Bot,          color: "text-red-400", bg: "bg-red-500/10", badge: "Auto-replied"    },
  { id: 2, type: "lead",       comment: '"How can I work with you? What\'s your rate?"',              reply: null,                                                            platform: "LinkedIn", time: "8m",  icon: AlertCircle,  color: "text-red-400", bg: "bg-red-500/10", badge: "Lead detected"   },
  { id: 3, type: "auto-reply", comment: '"This is exactly what I needed to read today 💯"',          reply: "Really glad it helped! Drop any questions below 👇",           platform: "Instagram",time: "15m", icon: Bot,          color: "text-red-400", bg: "bg-red-500/10", badge: "Auto-replied"    },
  { id: 4, type: "escalated",  comment: '"My account has been charged twice and I can\'t get support"',reply: null,                                                          platform: "X",        time: "31m", icon: AlertCircle,  color: "text-red-500", bg: "bg-red-600/10", badge: "Escalated"       },
  { id: 5, type: "auto-reply", comment: '"Great post as always 🔥🔥"',                               reply: "Appreciate that! 🔥 Stay tuned, bigger things coming.",        platform: "Instagram",time: "44m", icon: Bot,          color: "text-red-400", bg: "bg-red-500/10", badge: "Auto-replied"    },
  { id: 6, type: "lead",       comment: '"Do you offer group coaching? I have 5 team members"',      reply: null,                                                            platform: "LinkedIn", time: "1h",  icon: AlertCircle,  color: "text-red-400", bg: "bg-red-500/10", badge: "Lead detected"   },
];

const RULES = [
  { label: "Auto-reply to compliments & emojis",  enabled: true  },
  { label: "Flag comments asking about prices",    enabled: true  },
  { label: "Escalate customer complaints",         enabled: true  },
  { label: "Auto-reply to 'great post' variants",  enabled: true  },
  { label: "Detect & flag potential leads",         enabled: true  },
  { label: "Ignore spam comments",                  enabled: false },
];

export default function GhostModePage() {
  const [agentActive, setAgentActive] = useState(true);
  const [rules, setRules] = useState(RULES);

  const toggleRule = (i: number) =>
    setRules((prev) => prev.map((r, j) => (i === j ? { ...r, enabled: !r.enabled } : r)));

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
            <span className={cn("w-2 h-2 rounded-full", agentActive ? "bg-red-400 animate-pulse" : "bg-muted-foreground")} />
            {agentActive ? "Agent Active" : "Agent Paused"}
          </Badge>
          <Button variant={agentActive ? "outline" : "gradient"} size="sm" className="gap-2" onClick={() => setAgentActive(!agentActive)}>
            {agentActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {agentActive ? "Pause Agent" : "Activate Agent"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Auto-replies sent (today)", value: "47",   color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Leads flagged (today)",     value: "6",    color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Hours saved this week",     value: "14.2h",color: "text-red-400", bg: "bg-red-500/10" },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card text-center">
            <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Action log */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="font-semibold mb-4">Live Agent Log</h3>
            <div className="space-y-3">
              {AGENT_ACTIONS.map((action) => (
                <div key={action.id} className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${action.color}`}>{action.badge}</span>
                        <span className="text-xs text-muted-foreground">{action.platform}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{action.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground italic mb-1">
                        &ldquo;{action.comment}&rdquo;
                      </p>
                      {action.reply && (
                        <p className="text-sm text-foreground bg-red-500/5 border border-red-500/10 rounded-md px-3 py-1.5">
                          → {action.reply}
                        </p>
                      )}
                      {!action.reply && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="gradient" className="h-7 text-xs px-3">Reply now</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-3">Dismiss</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-red-400" />
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
