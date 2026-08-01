import { assertEquals, assertNotEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  calculateConfidence,
  blendPrices,
  detectTrend,
  buildFactualReasoning,
  localFallback,
  parseAIResponse,
  DEFAULT_CONFIG,
  type HistoryStats,
} from "./pricing.ts";

// ─── calculateConfidence ────────────────────────────────────

Deno.test("calculateConfidence returns high for 50+ records with low variance", () => {
  assertEquals(calculateConfidence(60, 200, 3000), "high");
});

Deno.test("calculateConfidence returns medium for 50+ records with high variance", () => {
  assertEquals(calculateConfidence(60, 1500, 3000), "medium");
});

Deno.test("calculateConfidence returns medium for 10-49 records", () => {
  assertEquals(calculateConfidence(25, null, null), "medium");
});

Deno.test("calculateConfidence returns low for <10 records", () => {
  assertEquals(calculateConfidence(5, null, null), "low");
});

Deno.test("calculateConfidence returns low for 0 records", () => {
  assertEquals(calculateConfidence(0, null, null), "low");
});

// ─── blendPrices ────────────────────────────────────────────

Deno.test("blendPrices returns AI price when no history", () => {
  assertEquals(blendPrices(null, 3000, 0), 3000);
});

Deno.test("blendPrices returns historical when no AI", () => {
  assertEquals(blendPrices(2500, null, 20), 2500);
});

Deno.test("blendPrices weights history more with more records", () => {
  // 50 records → 70% history weight
  const result = blendPrices(2000, 3000, 50);
  // 2000 * 0.7 + 3000 * 0.3 = 1400 + 900 = 2300
  assertEquals(result, 2300);
});

Deno.test("blendPrices weights AI more with few records", () => {
  // 5 records → 7% history weight
  const result = blendPrices(2000, 3000, 5);
  // 2000 * 0.07 + 3000 * 0.93 = 140 + 2790 = 2930
  assertEquals(result, 2930);
});

Deno.test("blendPrices with equal prices returns same", () => {
  assertEquals(blendPrices(2500, 2500, 30), 2500);
});

// ─── detectTrend ────────────────────────────────────────────

Deno.test("detectTrend returns stable for <4 prices", () => {
  assertEquals(detectTrend([100, 200, 300]), "stable");
});

Deno.test("detectTrend returns stable for equal halves", () => {
  assertEquals(detectTrend([100, 100, 100, 100]), "stable");
});

Deno.test("detectTrend returns rising when recent > older", () => {
  assertEquals(detectTrend([200, 200, 100, 100]), "rising");
});

Deno.test("detectTrend returns falling when recent < older", () => {
  assertEquals(detectTrend([100, 100, 200, 200]), "falling");
});

Deno.test("detectTrend handles empty array", () => {
  assertEquals(detectTrend([]), "stable");
});

// ─── buildFactualReasoning ──────────────────────────────────

Deno.test("buildFactualReasoning includes all params", () => {
  const result = buildFactualReasoning({
    historicalLoads: 43,
    historicalMedian: 2850,
    distanceKm: 450,
    vehicleType: "22ft",
    corridorMultiplier: 1.05,
    seasonalMultiplier: 1.08,
    provider: "data",
  });
  assertEquals(result.includes("43 recent shipments"), true);
  assertEquals(result.includes("median ₹2850/t"), true);
  assertEquals(result.includes("450km"), true);
  assertEquals(result.includes("22ft"), true);
  assertEquals(result.includes("+5% corridor"), true);
  assertEquals(result.includes("1.08x seasonal"), true);
});

Deno.test("buildFactualReasoning falls back to provider when no data", () => {
  const result = buildFactualReasoning({
    historicalLoads: 0,
    historicalMedian: null,
    distanceKm: null,
    vehicleType: null,
    corridorMultiplier: 1.0,
    seasonalMultiplier: 1.0,
    provider: "Gemini",
  });
  assertEquals(result, "Estimated using Gemini pricing model.");
});

Deno.test("buildFactualReasoning handles negative corridor multiplier", () => {
  const result = buildFactualReasoning({
    historicalLoads: 0,
    historicalMedian: null,
    distanceKm: null,
    vehicleType: null,
    corridorMultiplier: 0.95,
    seasonalMultiplier: 1.0,
    provider: "data",
  });
  assertEquals(result.includes("-5% corridor"), true);
});

// ─── localFallback ──────────────────────────────────────────

Deno.test("localFallback uses historical median when available", () => {
  const history: HistoryStats = {
    rows: [{ price_per_tonne: 2800, weight_tonnes: 10, created_at: "" }],
    loads: 20,
    median: 2800,
    p25: 2600,
    p75: 3000,
    iqr: 400,
    avg: 2800,
  };
  const result = localFallback(10, history, null, null, 1.0, 1.0);
  assertEquals(result.recommendedPrice, 2800);
  assertEquals(result.confidence, "medium");
  assertEquals(result.provider, "data");
});

Deno.test("localFallback uses vehicle config with distance", () => {
  const history: HistoryStats = {
    rows: [],
    loads: 0,
    median: null,
    p25: null,
    p75: null,
    iqr: null,
    avg: null,
  };
  const config = DEFAULT_CONFIG.find((c) => c.vehicle_type === "22ft")!;
  const result = localFallback(10, history, 300, config, 1.0, 1.0);
  // 22 * 300 / 10 = 660, clamped to [2800, 5500] = 2800
  assertEquals(result.recommendedPrice, 2800);
  assertEquals(result.confidence, "medium");
  assertEquals(result.provider, "config");
});

Deno.test("localFallback applies corridor and seasonal multipliers", () => {
  const history: HistoryStats = {
    rows: [],
    loads: 0,
    median: null,
    p25: null,
    p75: null,
    iqr: null,
    avg: null,
  };
  const config = DEFAULT_CONFIG.find((c) => c.vehicle_type === "22ft")!;
  const result = localFallback(10, history, 300, config, 1.05, 1.1);
  // 22 * 300 / 10 = 660, clamped to 2800, then * 1.05 * 1.1 = 3234
  assertEquals(result.recommendedPrice, 3234);
});

Deno.test("localFallback uses weight tiers as last resort", () => {
  const history: HistoryStats = {
    rows: [],
    loads: 0,
    median: null,
    p25: null,
    p75: null,
    iqr: null,
    avg: null,
  };
  const result20 = localFallback(20, history, null, null, 1.0, 1.0);
  assertEquals(result20.recommendedPrice, 2500);

  const result15 = localFallback(15, history, null, null, 1.0, 1.0);
  assertEquals(result15.recommendedPrice, 3000);

  const result5 = localFallback(5, history, null, null, 1.0, 1.0);
  assertEquals(result5.recommendedPrice, 4000);
});

Deno.test("localFallback weight tiers apply multipliers", () => {
  const history: HistoryStats = {
    rows: [],
    loads: 0,
    median: null,
    p25: null,
    p75: null,
    iqr: null,
    avg: null,
  };
  const result = localFallback(15, history, null, null, 1.08, 1.05);
  // 3000 * 1.08 * 1.05 = 3402
  assertEquals(result.recommendedPrice, 3402);
});

// ─── parseAIResponse ────────────────────────────────────────

Deno.test("parseAIResponse parses valid JSON", () => {
  const input = '{"recommendedPrice":2500,"range":{"min":2000,"max":3000},"confidence":"high","trend":"stable","reasoning":"test"}';
  const result = parseAIResponse(input);
  assertNotEquals(result, null);
  assertEquals(result!.recommendedPrice, 2500);
});

Deno.test("parseAIResponse handles markdown-wrapped JSON", () => {
  const input = '```json\n{"recommendedPrice":2500,"range":{"min":2000,"max":3000},"confidence":"high","trend":"stable","reasoning":"test"}\n```';
  const result = parseAIResponse(input);
  assertNotEquals(result, null);
  assertEquals(result!.recommendedPrice, 2500);
});

Deno.test("parseAIResponse returns null for invalid JSON", () => {
  assertEquals(parseAIResponse("not json"), null);
});

Deno.test("parseAIResponse returns null for empty string", () => {
  assertEquals(parseAIResponse(""), null);
});

// ─── DEFAULT_CONFIG ─────────────────────────────────────────

Deno.test("DEFAULT_CONFIG has all vehicle types", () => {
  assertEquals(DEFAULT_CONFIG.length, 7);
  const types = DEFAULT_CONFIG.map((c) => c.vehicle_type);
  assertEquals(types.includes("mini_truck"), true);
  assertEquals(types.includes("trailer"), true);
});

Deno.test("DEFAULT_CONFIG has valid rate ranges", () => {
  for (const config of DEFAULT_CONFIG) {
    assertEquals(config.rate_per_km > 0, true);
    assertEquals(config.min_price > 0, true);
    assertEquals(config.max_price > config.min_price, true);
  }
});
