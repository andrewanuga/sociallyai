// ============================================================
// SociallyAI — App-wide constants
// ============================================================

export const APP_NAME = "SociallyAI";
export const APP_TAGLINE = "Stop Managing Social Media. Start Delegating It.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://sociallyai.co";

// ── Plan limits ──────────────────────────────────────────────
export const PLAN_LIMITS = {
  free: {
    accounts: 1,
    generationsPerWeek: 7,
    agents: 0,
    teamSeats: 1,
  },
  basic: {
    accounts: 3,
    generationsPerMonth: 100,
    agents: 0,
    teamSeats: 1,
  },
  pro: {
    accounts: 7,
    generationsPerMonth: 500,
    agents: 1,
    teamSeats: 2,
  },
  advanced: {
    accounts: 15,
    generationsPerMonth: 1000,
    agents: 3,
    teamSeats: 5,
  },
} as const;

// ── Plan prices (Naira) ──────────────────────────────────────
export const PLAN_PRICES = {
  free: 0,
  basic: 5000,
  pro: 12000,
  advanced: 25000,
} as const;

// ── Platforms ────────────────────────────────────────────────
export const PLATFORMS = [
  { id: "x", label: "X (Twitter)", maxChars: 280, color: "#1DA1F2" },
  { id: "linkedin", label: "LinkedIn", maxChars: 3000, color: "#0077B5" },
  { id: "instagram", label: "Instagram", maxChars: 2200, color: "#E1306C" },
  { id: "tiktok", label: "TikTok", maxChars: 2200, color: "#888888" },
  { id: "threads", label: "Threads", maxChars: 500, color: "#000000" },
  { id: "youtube", label: "YouTube Shorts", maxChars: 100, color: "#FF0000" },
  { id: "whatsapp", label: "WhatsApp Channels", maxChars: 1024, color: "#25D366" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

// ── Ghost Mode action types ──────────────────────────────────
export const AGENT_ACTIONS = {
  AUTO_REPLY: "auto_reply",
  FLAG_LEAD: "flag_lead",
  ESCALATE_COMPLAINT: "escalate_complaint",
  IGNORE: "ignore",
} as const;

// ── Writing frameworks ───────────────────────────────────────
export const FRAMEWORKS = [
  {
    id: "aida",
    label: "AIDA",
    desc: "Attention → Interest → Desire → Action",
  },
  { id: "pas", label: "PAS", desc: "Problem → Agitate → Solve" },
  {
    id: "hook",
    label: "Curiosity Hook",
    desc: "Open loop to drive 'See More' clicks",
  },
  { id: "story", label: "Story Arc", desc: "Narrative-driven, high-retention" },
] as const;

// ── Brand tones ──────────────────────────────────────────────
export const TONES = [
  "Professional",
  "Casual",
  "Naija Vibe",
  "Witty",
  "Inspirational",
  "Educational",
  "Provocative",
  "Storyteller",
] as const;

// ── Socially Score thresholds ────────────────────────────────
export const SCORE_THRESHOLDS = {
  HIGH: 75,
  MEDIUM: 50,
} as const;

// ── Paystack plan codes (add real codes from Paystack dashboard) ──
export const PAYSTACK_PLANS = {
  basic: process.env.NEXT_PUBLIC_PAYSTACK_BASIC_PLAN || "PLN_xxxx",
  pro: process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN || "PLN_xxxx",
  advanced: process.env.NEXT_PUBLIC_PAYSTACK_ADVANCED_PLAN || "PLN_xxxx",
} as const;
