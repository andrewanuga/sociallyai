"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-[var(--sai-indigo)]/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/25";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toastError("Failed to send reset link", error.message);
      setLoading(false);
      return;
    }
    
    toastSuccess("Reset link sent", "Check your email for instructions.");
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="glass-panel rounded-3xl p-8">
          <h2 className="font-display text-2xl font-semibold text-white">Check your email</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            We sent a password reset link to <span className="font-medium text-white">{email}</span>.
          </p>
          <div className="mt-6">
            <Link href="/login" className="text-sm font-medium text-[var(--sai-indigo)] hover:text-indigo-300">
              Return to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-white">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8">
        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/70">Email address</Label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg,#6366f1 0%,#a855f7 70%,#f5c451 130%)",
              boxShadow: "0 0 34px -8px rgba(99,102,241,0.7)",
            }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Send reset link <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-white/45">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-[var(--sai-indigo)] transition-colors hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
