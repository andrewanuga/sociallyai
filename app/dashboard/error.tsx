"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h2 className="text-xl font-bold mb-2">Dashboard error</h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        Something went wrong loading this page. Your data is safe.
      </p>
      <Button variant="gradient" className="gap-2" onClick={reset}>
        <RefreshCw className="w-4 h-4" />
        Try again
      </Button>
    </div>
  );
}
