"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-[var(--sai-indigo)]/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/25";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { error: toastError } = useToast();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("suspended") === "1") {
      toastError("Account suspended", "Contact support if you think this is a mistake.");
      window.history.replaceState({}, "", "/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      toastError("Couldn't sign in", authError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) toastError("Google sign-in failed", authError.message);
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Sign in to your Socially AI workspace.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8">
        {/* Google SSO */}
        {/* <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.05] text-sm font-medium text-white transition-colors hover:bg-white/[0.09]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="font-data bg-transparent px-3 text-[11px] uppercase tracking-widest text-white/35">
              or with email
            </span>
          </div>
        </div> */}

        <form onSubmit={handleLogin} className="space-y-5">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/70">Password</Label>
              <Link href="/reset-password" className="text-xs text-[var(--sai-indigo)] transition-colors hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
                Sign in <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-white/45">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-[var(--sai-indigo)] transition-colors hover:text-indigo-300">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
