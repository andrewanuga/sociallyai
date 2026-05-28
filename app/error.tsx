"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
      <p className="text-muted-foreground text-lg max-w-md mb-3">
        An unexpected error occurred. Our team has been notified.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/60 font-mono mb-8">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="gradient" size="lg" className="gap-2" onClick={reset}>
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg" className="gap-2">
            <Home className="w-4 h-4" />
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
