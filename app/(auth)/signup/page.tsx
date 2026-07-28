"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, Check, MailCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains a special character", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

const inputCls =
  "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-[var(--sai-indigo)]/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/25";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="glass-panel rounded-3xl p-8">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "color-mix(in srgb, var(--sai-indigo) 16%, transparent)" }}
          >
            <MailCheck className="h-8 w-8 text-[var(--sai-indigo)]" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white">Check your email</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            We sent a confirmation link to{" "}
            <span className="font-medium text-white">{email}</span>. Click it to
            activate your account and start your free trial.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-white">
          Start your free trial
        </h1>
        <p className="mt-2 text-sm text-white/50">
          14 days free. No credit card required.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8">
        <button
          type="button"
          onClick={handleGoogleSignup}
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
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/70">Full name</Label>
            <input
              id="name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
            />
          </div>

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
            <Label htmlFor="password" className="text-white/70">Password</Label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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

            {password && (
              <div className="mt-2 space-y-1.5">
                {PASSWORD_REQUIREMENTS.map((req, i) => {
                  const ok = req.test(password);
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors"
                        style={
                          ok
                            ? { background: "var(--sai-indigo)" }
                            : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }
                        }
                      >
                        {ok && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className={ok ? "text-[var(--sai-indigo)]" : "text-white/45"}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-[var(--sai-red)]/25 bg-[var(--sai-red)]/10 p-3 text-sm text-[var(--sai-red)]">
              {error}
            </div>
          )}

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
                Create account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/40">
          By signing up, you agree to our{" "}
          <Link href="#" className="text-[var(--sai-indigo)] hover:underline">Terms</Link> and{" "}
          <Link href="#" className="text-[var(--sai-indigo)] hover:underline">Privacy Policy</Link>.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-white/45">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--sai-indigo)] transition-colors hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
