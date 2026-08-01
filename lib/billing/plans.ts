// Billing plans — single source of truth for pricing + Paystack plan codes.
export type PlanId = "free" | "basic" | "pro" | "advanced" | "teams_infinity";

export interface PlanConfig {
  id: PlanId;
  name: string;
  /** Naira per month (major units). */
  price: number;
  /** Env var holding the Paystack plan code for subscriptions. */
  planCodeEnv?: string;
  /** Monthly AI generation allowance. */
  generations: number;
  /** Connected social account limit. */
  accounts: number;
  /** Autonomous bots/agents limit. */
  bots: number;
  /** Maximum number of team collaborators allowed. */
  collaborators: number;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { id: "free", name: "Free", price: 0, generations: 28, accounts: 1, bots: 0, collaborators: 0 },
  basic: { id: "basic", name: "Basic", price: 5000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_BASIC_PLAN", generations: 100, accounts: 3, bots: 0, collaborators: 3 },
  pro: { id: "pro", name: "Pro", price: 12000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_PRO_PLAN", generations: 500, accounts: 7, bots: 1, collaborators: 5 },
  advanced: { id: "advanced", name: "Advanced", price: 25000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_ADVANCED_PLAN", generations: 1000, accounts: 15, bots: 3, collaborators: 10 },
  teams_infinity: { id: "teams_infinity", name: "Teams Infinity", price: 150000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_TEAMS_INFINITY_PLAN", generations: 5000, accounts: 50, bots: 10, collaborators: 9999 }, // Price set to ~ $100 equivalent in NGN (assuming 1500/$), or 150,000 NGN.
};

export const PLAN_ORDER: PlanId[] = ["free", "basic", "pro", "advanced", "teams_infinity"];

/** Paystack works in kobo (₦1 = 100 kobo). */
export const toKobo = (naira: number) => Math.round(naira * 100);

export const isPlan = (v: string): v is PlanId => v in PLANS;
