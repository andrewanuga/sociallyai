"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function SyncButton() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Auto-sync silently on page load
    const silentSync = async () => {
      try {
        const res = await fetch("/api/social/sync", { method: "POST" });
        if (res.ok) router.refresh();
      } catch (e) {
        // silently fail on auto-sync
      }
    };
    silentSync();
  }, [router]);

  const sync = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/social/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      if (data.accounts === 0) toastError("Nothing to sync", "Connect an account first.");
      else success("Synced", `${data.synced} items from ${data.accounts} account(s).`);
      router.refresh();
    } catch (e) {
      toastError("Sync failed", e instanceof Error ? e.message : undefined);
    } finally { setBusy(false); }
  };

  return (
    <button
      onClick={sync}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2 text-[13px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sync now
    </button>
  );
}
