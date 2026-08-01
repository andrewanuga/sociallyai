/**
 * Model registry with per-agent defaults.
 *
 * Each "agent" in Socially AI (Chat, Generate, Ghost, Score, Trends)
 * gets its own default model and temperature — personalized for the task.
 * Users can override the model globally in Settings, or per-conversation
 * in the Create page.
 */

/* ── Agent IDs ────────────────────────────────────────────────── */

export type AgentId = "chat" | "generate" | "ghost" | "score" | "trends";

/* ── Per-agent defaults ───────────────────────────────────────── */

export interface AgentConfig {
  /** Display name for the agent */
  label: string;
  /** Description of what this agent does */
  description: string;
  /** Default OpenRouter model ID */
  defaultModel: string;
  /** Default temperature (0-2) */
  temperature: number;
  /** Default max tokens */
  maxTokens: number;
  /** Whether this agent benefits from vision models */
  supportsVision: boolean;
}

/**
 * Default configs per agent. These are used when the user hasn't
 * selected a model in Settings. Each agent is optimized for its task.
 */
export const AGENT_DEFAULTS: Record<AgentId, AgentConfig> = {
  chat: {
    label: "Create Agent",
    description: "Drafts posts, threads, captions, and replies in your voice",
    defaultModel: "google/gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 1024,
    supportsVision: true,
  },
  generate: {
    label: "Content Generator",
    description: "Structured content generation with frameworks (AIDA, PAS, etc.)",
    defaultModel: "google/gemini-2.5-flash",
    temperature: 0.8,
    maxTokens: 1024,
    supportsVision: false,
  },
  ghost: {
    label: "Ghost Mode Agent",
    description: "Auto-replies to comments and classifies leads/complaints",
    defaultModel: "google/gemini-2.5-flash",
    temperature: 0.4,
    maxTokens: 256,
    supportsVision: false,
  },
  score: {
    label: "Content Scorer",
    description: "Scores posts on engagement potential and gives improvement tips",
    defaultModel: "google/gemini-2.5-flash",
    temperature: 0.3,
    maxTokens: 512,
    supportsVision: false,
  },
  trends: {
    label: "Trend Analyst",
    description: "Discovers trending topics and suggests content ideas for your niche",
    defaultModel: "google/gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 1024,
    supportsVision: false,
  },
};

/* ── Recommended models for the model picker ──────────────────── */

export interface RecommendedModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  tier: "free" | "budget" | "standard" | "premium";
  supportsVision: boolean;
  contextWindow: string;
  bestFor: string[];
}

export const RECOMMENDED_MODELS: RecommendedModel[] = [
  // — Premium tier —
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    description: "Excellent writing quality, nuanced and creative",
    tier: "premium",
    supportsVision: true,
    contextWindow: "200K",
    bestFor: ["writing", "creativity", "analysis"],
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Versatile flagship model with strong multimodal support",
    tier: "premium",
    supportsVision: true,
    contextWindow: "128K",
    bestFor: ["writing", "vision", "versatility"],
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "Google's most capable model with massive context",
    tier: "premium",
    supportsVision: true,
    contextWindow: "1M",
    bestFor: ["analysis", "long-context", "vision"],
  },
  // — Standard tier —
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    description: "Fast, efficient, and great for most tasks",
    tier: "standard",
    supportsVision: true,
    contextWindow: "1M",
    bestFor: ["speed", "cost-efficiency", "vision"],
  },
  {
    id: "anthropic/claude-haiku-3.5",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description: "Quick and affordable with solid writing quality",
    tier: "standard",
    supportsVision: true,
    contextWindow: "200K",
    bestFor: ["speed", "writing", "cost-efficiency"],
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Compact and cost-effective with great performance",
    tier: "standard",
    supportsVision: true,
    contextWindow: "128K",
    bestFor: ["speed", "cost-efficiency", "versatility"],
  },
  // — Budget tier —
  {
    id: "meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "Meta",
    description: "Open-source powerhouse with strong capabilities",
    tier: "budget",
    supportsVision: true,
    contextWindow: "1M",
    bestFor: ["open-source", "cost-efficiency", "versatility"],
  },
  {
    id: "deepseek/deepseek-chat-v3-0324",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "Extremely cost-effective with competitive quality",
    tier: "budget",
    supportsVision: false,
    contextWindow: "164K",
    bestFor: ["cost-efficiency", "analysis", "writing"],
  },
  {
    id: "mistralai/mistral-small-3.2",
    name: "Mistral Small 3.2",
    provider: "Mistral",
    description: "Lightweight and fast, great for quick generations",
    tier: "budget",
    supportsVision: true,
    contextWindow: "128K",
    bestFor: ["speed", "cost-efficiency"],
  },
  // — Free tier —
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B (Free)",
    provider: "Google",
    description: "Free model — great for trying out the platform",
    tier: "free",
    supportsVision: false,
    contextWindow: "128K",
    bestFor: ["free", "experimentation"],
  },
  {
    id: "poolside/laguna-s-2.1:free",
    name: "Laguna S 2.1 (Free)",
    provider: "Poolside",
    description: "Free fast model for testing",
    tier: "free",
    supportsVision: false,
    contextWindow: "128K",
    bestFor: ["free", "testing"],
  },
];

/* ── Tier metadata ────────────────────────────────────────────── */

export const TIER_META: Record<
  RecommendedModel["tier"],
  { label: string; color: string; description: string }
> = {
  free: {
    label: "Free",
    color: "#34d399",
    description: "No cost — great for testing",
  },
  budget: {
    label: "Budget",
    color: "#60a5fa",
    description: "Very affordable per-token pricing",
  },
  standard: {
    label: "Standard",
    color: "#a78bfa",
    description: "Best balance of quality and cost",
  },
  premium: {
    label: "Premium",
    color: "#f59e0b",
    description: "Highest quality, best for important content",
  },
};

/* ── Helper: get display name for any model ID ────────────────── */

export function getModelDisplayName(modelId: string): string {
  const recommended = RECOMMENDED_MODELS.find((m) => m.id === modelId);
  if (recommended) return recommended.name;

  // Parse "provider/model-name" format
  const parts = modelId.split("/");
  const name = parts[parts.length - 1];
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Helper: get provider name from model ID ──────────────────── */

export function getModelProvider(modelId: string): string {
  const recommended = RECOMMENDED_MODELS.find((m) => m.id === modelId);
  if (recommended) return recommended.provider;

  const provider = modelId.split("/")[0] || "Unknown";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}
