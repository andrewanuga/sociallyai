// Billing plans — single source of truth for pricing + Paystack plan codes.
export type PlanId = "free" | "basic" | "pro" | "advanced";

export interface PlanConfig {
  id: PlanId;
  name: string;
  /** Naira per month (major units). */
  price: number;
  /** Env var holding the Paystack plan code for subscriptions. */
  planCodeEnv?: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { id: "free", name: "Free", price: 0 },
  basic: { id: "basic", name: "Basic", price: 5000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_BASIC_PLAN" },
  pro: { id: "pro", name: "Pro", price: 12000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_PRO_PLAN" },
  advanced: { id: "advanced", name: "Advanced", price: 25000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_ADVANCED_PLAN" },
};

export const PLAN_ORDER: PlanId[] = ["free", "basic", "pro", "advanced"];

/** Paystack works in kobo (₦1 = 100 kobo). */
export const toKobo = (naira: number) => Math.round(naira * 100);

export const isPlan = (v: string): v is PlanId => v in PLANS;
