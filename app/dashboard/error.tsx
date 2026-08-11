"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, ServerCrash } from "lucide-react";
import { GlassCard, PrimaryButton } from "@/components/dashboard/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <GlassCard className="max-w-[440px] w-full p-10 flex flex-col items-center relative overflow-hidden border border-[var(--stroke)] shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-inner relative z-10">
          <ServerCrash className="w-10 h-10 text-red-400 drop-shadow-md" />
        </div>
        
        <h2 className="text-2xl font-display font-bold text-[var(--fg)] mb-3 relative z-10">
          Oops! Something broke.
        </h2>
        
        <p className="text-[var(--fg-3)] text-sm mb-8 leading-relaxed relative z-10">
          We encountered an unexpected error while trying to load this page. Don't worry, your data is completely safe.
        </p>
        
        <div className="w-full flex justify-center relative z-10">
          <PrimaryButton onClick={reset} className="px-6 h-11 w-full max-w-[200px] flex items-center justify-center gap-2 group">
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </PrimaryButton>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 w-full text-left bg-black/40 border border-[var(--stroke)] p-4 rounded-xl relative z-10 overflow-hidden">
            <p className="text-xs font-mono text-red-400 break-words">
              {error.message || "Unknown error"}
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
