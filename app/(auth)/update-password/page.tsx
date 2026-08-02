"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-[var(--sai-indigo)]/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/25";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      toastError("Couldn't update password", error.message);
      setLoading(false);
      return;
    }
    
    toastSuccess("Password updated", "You can now log in with your new password.");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-white">
          Update password
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Please enter your new password below.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8">
        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70">New Password</Label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
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
                Update password <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
