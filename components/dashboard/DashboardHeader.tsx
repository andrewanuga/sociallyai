"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Bell, Sun, Moon, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export function DashboardHeader({ title, onMobileMenuToggle }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-xl font-semibold hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="flex-1 max-w-xs mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, trends..."
            className="pl-9 h-9 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-red-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        )}

        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        </button>

        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src="" />
          <AvatarFallback className="bg-gradient-to-br from-red-600 to-rose-700 text-white text-xs font-bold">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
