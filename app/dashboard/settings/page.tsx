"use client";

import { useState } from "react";
import { Settings, User, Bell, Shield, Link2, Palette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const CONNECTED_PLATFORMS = [
  { name: "X (Twitter)", letter: "X", color: "#1DA1F2", connected: true, handle: "@yourbrand" },
  { name: "LinkedIn", letter: "in", color: "#0077B5", connected: true, handle: "Your Company" },
  { name: "Instagram", letter: "IG", color: "#E1306C", connected: false, handle: null },
  { name: "TikTok", letter: "TT", color: "#888", connected: false, handle: null },
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    leads: true,
    trends: true,
    agentActions: false,
    reports: true,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-muted-foreground" />
          Settings
        </h1>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <section className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input defaultValue="Andrew" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="andrew@example.com" type="email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Brand website URL</Label>
              <Input placeholder="https://yourbrand.com" />
            </div>
            <Button variant="gradient" size="sm">Save profile</Button>
          </div>
        </section>

        {/* Connected accounts */}
        <section className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <Link2 className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Connected Accounts</h2>
          </div>
          <div className="space-y-3">
            {CONNECTED_PLATFORMS.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: p.color !== "#888" ? p.color : undefined }}>
                    {p.letter}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    {p.handle && (
                      <p className="text-xs text-muted-foreground">{p.handle}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant={p.connected ? "outline" : "gradient"}
                  size="sm"
                  className="text-xs h-7"
                >
                  {p.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "leads", label: "Lead detected in inbox", desc: "When Ghost Mode flags a potential customer" },
              { key: "trends", label: "New trend alert", desc: "When a relevant trend is detected for your niche" },
              { key: "agentActions", label: "Agent actions", desc: "Every time Ghost Mode replies to a comment" },
              { key: "reports", label: "Weekly analytics report", desc: "Sunday performance summary email" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={notifications[n.key as keyof typeof notifications]}
                  onCheckedChange={(v) =>
                    setNotifications((prev) => ({ ...prev, [n.key]: v }))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section className="p-6 rounded-xl border border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-destructive" />
            <h2 className="font-semibold text-destructive">Danger Zone</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" className="text-xs">
              Delete account
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
