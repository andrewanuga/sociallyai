"use client";

import { useState } from "react";
import { UserX, Loader2 } from "lucide-react";
import { stopImpersonation } from "@/app/admin/users/actions";
import { useToast } from "@/components/ui/toast";

export function ImpersonationBannerClient({ targetId }: { targetId: string }) {
  const [stopping, setStopping] = useState(false);
  const { success, error } = useToast();

  const handleStop = async () => {
    setStopping(true);
    try {
      await stopImpersonation();
      success("Impersonation stopped");
      window.location.href = "/admin/users";
    } catch (e) {
      error("Failed to stop impersonation");
      setStopping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-[13px] font-medium text-red-500 shadow-lg backdrop-blur-md">
      <span>You are impersonating user: {targetId.split("-")[0]}...</span>
      <button 
        onClick={handleStop}
        disabled={stopping}
        className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {stopping ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3 w-3" />}
        Stop
      </button>
    </div>
  );
}
