"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toastError("Passwords do not match", "Please make sure your new passwords match.");
      return;
    }
    if (password.length < 6) {
      toastError("Password too short", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    setLoading(false);

    if (error) {
      toastError("Failed to update password", error.message);
    } else {
      toastSuccess("Password updated!", "Your password has been changed successfully.");
      router.push("/dashboard");
    }
  };

  const inputCls =
    "h-11 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/20";
  const btnCls =
    "relative flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50";

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sai-indigo)]/10 text-[var(--sai-indigo)]">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--fg)]">Set New Password</h1>
        <p className="text-sm text-[var(--fg-3)]">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--fg-2)]">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pr-10`}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-4)] transition-colors hover:text-[var(--fg)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--fg-2)]">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputCls} pr-10`}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          className={btnCls}
          disabled={loading || !password || !confirmPassword}
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}
