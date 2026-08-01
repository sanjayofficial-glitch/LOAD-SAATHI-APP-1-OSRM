// Pure pricing functions extracted for testability
// These are the core algorithms used by price-predict/index.ts

export interface HistoryStats {
  rows: { price_per_tonne: number; weight_tonnes: number; created_at: string }[];
  loads: number;
  median: number | null;
  p25: number | null;
  p75: number | null;
  iqr: number | null;
  avg: number | null;
}

export interface PricingConfig {
  vehicle_type: string;
  rate_per_km: number;
  min_price: number;
  max_price: number;
  base_capacity_tonnes: number | null;
}

export function calculateConfidence(
  historicalLoads: number,
  iqr: number | null,
  median: number | null,
): "high" | "medium" | "low" {
  if (historicalLoads >= 50 && iqr !== null && median !== null) {
    const cv = iqr / median;
    if (cv < 0.3) return "high";
    return "medium";
  }
  if (historicalLoads >= 10) return "medium";
  return "low";
}

export function blendPrices(
  historicalMedian: number | null,
  aiPrice: number | null,
  historicalLoads: number,
): number {
  if (!historicalMedian) return aiPrice!;
  if (!aiPrice) return historicalMedian;
  const historyWeight = Math.min(0.7, (historicalLoads / 50) * 0.7);
  const aiWeight = 1 - historyWeight;
  return Math.round(historicalMedian * historyWeight + aiPrice * aiWeight);
}

export function detectTrend(prices: number[]): "rising" | "falling" | "stable" {
  if (prices.length < 4) return "stable";
  const half = Math.floor(prices.length / 2);
  const recentAvg = prices.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const olderAvg = prices.slice(half).reduce((a, b) => a + b, 0) / (prices.length - half);
  const diff = (recentAvg - olderAvg) / olderAvg;
  if (diff > 0.05) return "rising";
  if (diff < -0.05) return "falling";
  return "stable";
}

export function buildFactualReasoning(params: {
  historicalLoads: number;
  historicalMedian: number | null;
  distanceKm: number | null;
  vehicleType: string | null;
  corridorMultiplier: number;
  seasonalMultiplier: number;
  provider: string;
}): string {
  const parts: string[] = [];
  if (params.historicalLoads > 0 && params.historicalMedian) {
    parts.push(`Based on ${params.historicalLoads} recent shipments, median ₹${params.historicalMedian}/t`);
  }
  if (params.distanceKm) {
    parts.push(`Route ~${params.distanceKm}km`);
  }
  if (params.vehicleType) {
    parts.push(`Vehicle: ${params.vehicleType}`);
  }
  if (params.corridorMultiplier !== 1.0) {
    const pct = Math.round((params.corridorMultiplier - 1) * 100);
    parts.push(`${pct > 0 ? "+" : ""}${pct}% corridor adjustment`);
  }
  if (params.seasonalMultiplier !== 1.0) {
    parts.push(`${params.seasonalMultiplier}x seasonal factor`);
  }
  if (parts.length === 0) {
    return `Estimated using ${params.provider} pricing model.`;
  }
  return parts.join(". ") + ".";
}

export function localFallback(
  weightTonnes: number,
  history: HistoryStats,
  distanceKm: number | null,
  vehicleConfig: PricingConfig | null,
  corridorMultiplier: number,
  seasonalMultiplier: number,
): { recommendedPrice: number; range: { min: number; max: number }; confidence: string; provider: string } {
  // Tier 1: Historical median with multipliers
  if (history.median && history.loads > 5) {
    const base = history.median * corridorMultiplier * seasonalMultiplier;
    const spread = history.iqr ? Math.round(history.iqr / 2) : Math.round(base * 0.15);
    return {
      recommendedPrice: Math.round(base),
      range: { min: Math.round(base - spread), max: Math.round(base + spread) },
      confidence: history.loads >= 50 ? "high" : "medium",
      provider: "data",
    };
  }

  // Tier 2: Distance-based with vehicle config
  if (distanceKm && vehicleConfig) {
    const base = (vehicleConfig.rate_per_km * distanceKm) / (weightTonnes || 1);
    const clamped = Math.max(vehicleConfig.min_price, Math.min(vehicleConfig.max_price, base));
    const adjusted = clamped * corridorMultiplier * seasonalMultiplier;
    const spread = Math.round(adjusted * 0.2);
    return {
      recommendedPrice: Math.round(adjusted),
      range: { min: Math.round(adjusted - spread), max: Math.round(adjusted + spread) },
      confidence: "medium",
      provider: "config",
    };
  }

  // Tier 3: Weight-based tiers (original behavior)
  const baseRate = weightTonnes >= 20 ? 2500 : weightTonnes >= 10 ? 3000 : 4000;
  const price = Math.round(baseRate * corridorMultiplier * seasonalMultiplier);
  const spread = Math.round(price * 0.2);
  return {
    recommendedPrice: price,
    range: { min: price - spread, max: price + spread },
    confidence: "low",
    provider: "data",
  };
}

export function parseAIResponse(text: string): { recommendedPrice: number; range: { min: number; max: number }; confidence: string; trend: string; reasoning: string } | null {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export const DEFAULT_CONFIG: PricingConfig[] = [
  { vehicle_type: "mini_truck", rate_per_km: 14, min_price: 1800, max_price: 3500, base_capacity_tonnes: 2 },
  { vehicle_type: "pickup", rate_per_km: 16, min_price: 2000, max_price: 4000, base_capacity_tonnes: 3 },
  { vehicle_type: "14ft", rate_per_km: 18, min_price: 2200, max_price: 4500, base_capacity_tonnes: 5 },
  { vehicle_type: "17ft", rate_per_km: 20, min_price: 2500, max_price: 5000, base_capacity_tonnes: 8 },
  { vehicle_type: "22ft", rate_per_km: 22, min_price: 2800, max_price: 5500, base_capacity_tonnes: 12 },
  { vehicle_type: "container", rate_per_km: 25, min_price: 3000, max_price: 6000, base_capacity_tonnes: 16 },
  { vehicle_type: "trailer", rate_per_km: 28, min_price: 3200, max_price: 7000, base_capacity_tonnes: 25 },
];
