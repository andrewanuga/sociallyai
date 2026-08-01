"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toastSuccess, toastError } = useToast();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    setLoading(false);

    if (error) {
      toastError("Failed to send reset link", error.message);
    } else {
      setSubmitted(true);
      toastSuccess("Reset link sent!", "Check your email for the password reset link.");
    }
  };

  const inputCls =
    "h-11 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/20";
  const btnCls =
    "relative flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50";

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sai-indigo)]/10 text-[var(--sai-indigo)]">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--fg)]">Check your email</h1>
        <p className="mb-8 text-sm text-[var(--fg-3)]">
          We've sent a password reset link to <span className="font-semibold text-[var(--fg)]">{email}</span>.
        </p>
        <Link href="/login" className="text-sm font-medium text-[var(--sai-indigo)] hover:underline">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <Link href="/login" className="mb-8 flex items-center gap-2 text-sm text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
      
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--fg)]">Forgot Password</h1>
        <p className="text-sm text-[var(--fg-3)]">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--fg-2)]">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={btnCls}
          disabled={loading || !email}
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
