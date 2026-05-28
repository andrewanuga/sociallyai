"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_LIMITS } from "@/lib/constants";
import type { Plan } from "@/lib/supabase/types";

interface GenerationsState {
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  plan: Plan;
}

export function useGenerations() {
  const [state, setState] = useState<GenerationsState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("plan, generations_used")
        .eq("id", user.id)
        .single();

      if (data) {
        const plan = data.plan as Plan;
        const limits = PLAN_LIMITS[plan];
        const limit =
          "generationsPerMonth" in limits
            ? limits.generationsPerMonth
            : "generationsPerWeek" in limits
              ? limits.generationsPerWeek * 4
              : 0;

        setState({
          used: data.generations_used,
          limit,
          remaining: Math.max(limit - data.generations_used, 0),
          percentUsed: Math.min(
            Math.round((data.generations_used / limit) * 100),
            100
          ),
          plan,
        });
      }

      setLoading(false);
    };

    fetch();
  }, []);

  return { generations: state, loading };
}
