/**
 * Centralized OpenRouter API client.
 *
 * Every AI route imports `callAI` instead of managing its own fetch.
 * One shared API key from OPENROUTER_API_KEY env var.
 * Falls back to mock responses when the key is absent (dev mode).
 */

import { AGENT_DEFAULTS, type AgentId } from "./models";

/* ── Types ────────────────────────────────────────────────────── */

/** OpenRouter chat message — supports text and multimodal (vision) */
export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

export interface AICallOptions {
  /** Which agent is calling — determines the default model & temperature */
  agent: AgentId;
  /** Override model (e.g. user selected a specific model in settings) */
  model?: string;
  /** Override temperature */
  temperature?: number;
  /** Max tokens for the response */
  maxTokens?: number;
  /** Request JSON output */
  jsonMode?: boolean;
  /** Stream the response (returns ReadableStream instead of string) */
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

/* ── Constants ────────────────────────────────────────────────── */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

function getApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY;
}

function getDefaultModel(): string {
  return process.env.OPENROUTER_DEFAULT_MODEL || "google/gemini-2.5-flash";
}

/* ── Main call function ───────────────────────────────────────── */

/**
 * Send a chat completion request to OpenRouter.
 *
 * @param messages  - Array of chat messages (supports multimodal content)
 * @param options   - Agent ID, model override, temperature, etc.
 * @returns         - AI response with content and metadata
 */
export async function callAI(
  messages: ChatMessage[],
  options: AICallOptions,
): Promise<AIResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const agentConfig = AGENT_DEFAULTS[options.agent];
  const model = options.model || agentConfig.defaultModel || getDefaultModel();
  const temperature = options.temperature ?? agentConfig.temperature;
  const maxTokens = options.maxTokens ?? agentConfig.maxTokens;

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: false,
  };

  // JSON mode — only if the model supports it
  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Socially AI",
  };

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errorMsg = `OpenRouter error ${res.status}: ${errText}`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error && parsed.error.message) {
        errorMsg = parsed.error.message;
      }
    } catch {}
    console.error(`[OpenRouter] ${options.agent} error ${res.status}:`, errText);
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content?.trim() || "",
    model: data.model || model,
    usage: data.usage,
  };
}

/* ── Streaming call ───────────────────────────────────────────── */

/**
 * Stream a chat completion from OpenRouter via SSE.
 * Returns a ReadableStream of text chunks.
 */
export async function callAIStream(
  messages: ChatMessage[],
  options: AICallOptions,
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const agentConfig = AGENT_DEFAULTS[options.agent];
  const model = options.model || agentConfig.defaultModel || getDefaultModel();
  const temperature = options.temperature ?? agentConfig.temperature;
  const maxTokens = options.maxTokens ?? agentConfig.maxTokens;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Socially AI",
  };

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errorMsg = `OpenRouter stream error ${res.status}: ${errText}`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error && parsed.error.message) {
        errorMsg = parsed.error.message;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  // Transform SSE into a plain text stream
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const reader = res.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const payload = trimmed.slice(6);
            if (payload === "[DONE]") continue;

            try {
              const json = JSON.parse(payload);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

/* ── Model list fetcher ───────────────────────────────────────── */

let cachedModels: OpenRouterModel[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  top_provider?: { max_completion_tokens?: number };
  architecture?: { modality?: string; input_modalities?: string[] };
}

/**
 * Fetch available models from OpenRouter.
 * Cached for 1 hour.
 */
export async function fetchAvailableModels(): Promise<OpenRouterModel[]> {
  if (cachedModels && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedModels;
  }

  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const res = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      console.error("[OpenRouter] Failed to fetch models:", res.status);
      return cachedModels || [];
    }

    const data = await res.json();
    cachedModels = (data.data || []) as OpenRouterModel[];
    cacheTimestamp = Date.now();
    return cachedModels;
  } catch (err) {
    console.error("[OpenRouter] Model fetch error:", err);
    return cachedModels || [];
  }
}

/* ── Utility: check if a model supports vision ────────────────── */

export function modelSupportsVision(model: OpenRouterModel): boolean {
  const modality = model.architecture?.modality || "";
  const inputs = model.architecture?.input_modalities || [];
  return (
    modality.includes("image") ||
    inputs.includes("image") ||
    modality === "multimodal"
  );
}

/* ── Utility: build multimodal message with images ────────────── */

export function buildMultimodalContent(
  text: string,
  imageDataUrls: string[],
): ContentPart[] {
  const parts: ContentPart[] = [];

  // Add images first
  for (const dataUrl of imageDataUrls) {
    parts.push({
      type: "image_url",
      image_url: { url: dataUrl, detail: "auto" },
    });
  }

  // Add text
  parts.push({ type: "text", text });

  return parts;
}

/**
 * Check if the API key is configured.
 */
export function isConfigured(): boolean {
  return !!getApiKey();
}
