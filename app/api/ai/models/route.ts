import { NextResponse } from "next/server";
import { fetchAvailableModels, modelSupportsVision } from "@/lib/ai/openrouter";
import { RECOMMENDED_MODELS, TIER_META } from "@/lib/ai/models";

/**
 * GET /api/ai/models
 *
 * Returns available AI models for the model picker.
 * Merges curated recommended models with live OpenRouter catalog.
 */
export async function GET() {
  try {
    // Fetch live models from OpenRouter (cached 1hr)
    const liveModels = await fetchAvailableModels();

    // Build a lookup map for live model data
    const liveMap = new Map(liveModels.map((m) => [m.id, m]));

    // Enrich recommended models with live pricing data
    const recommended = RECOMMENDED_MODELS.map((rec) => {
      const live = liveMap.get(rec.id);
      return {
        ...rec,
        pricing: live
          ? {
              prompt: live.pricing.prompt,
              completion: live.pricing.completion,
            }
          : null,
        contextWindow: live
          ? `${Math.round(live.context_length / 1000)}K`
          : rec.contextWindow,
        available: !!live,
      };
    });

    // Build "all models" list from live OpenRouter data
    // Filter to only chat-capable models with reasonable pricing
    const allModels = liveModels
      .filter((m) => {
        // Only allow free models until billing is upgraded
        if (!m.pricing?.prompt || !m.pricing?.completion) return false;
        const promptPrice = parseFloat(m.pricing.prompt);
        const completionPrice = parseFloat(m.pricing.completion);
        if (promptPrice > 0 || completionPrice > 0) return false;
        return true;
      })
      .map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || "",
        provider: m.id.split("/")[0] || "unknown",
        contextWindow: `${Math.round(m.context_length / 1000)}K`,
        supportsVision: modelSupportsVision(m),
        pricing: {
          prompt: m.pricing.prompt,
          completion: m.pricing.completion,
        },
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      recommended,
      all: allModels,
      tiers: TIER_META,
    });
  } catch (err) {
    console.error("[/api/ai/models]", err);

    // Fallback to just recommended models without live data
    return NextResponse.json({
      recommended: RECOMMENDED_MODELS.map((r) => ({
        ...r,
        pricing: null,
        available: true,
      })),
      all: [],
      tiers: TIER_META,
    });
  }
}
