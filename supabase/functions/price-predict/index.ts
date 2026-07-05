import {
  getCorsHeaders,
  checkRateLimit,
  getRequestIp,
  extractBearerToken,
  verifyJwt,
  errorResponse,
  optionsResponse,
  generateRequestId,
} from "../_shared/edgeHelpers.ts";

function getEnv(name: string): string {
  return Deno.env.get(name) ?? "";
}

interface PricePredictRequest {
  originCity: string
  destinationCity: string
  originState?: string
  destinationState?: string
  weightTonnes: number
  vehicleType?: string
}

interface HistoryRow {
  price_per_tonne: number
}

interface PriceResult {
  recommendedPrice: number
  range: { min: number; max: number }
  confidence: "high" | "medium" | "low"
  trend: "rising" | "falling" | "stable"
  reasoning: string
}

interface ProviderResult {
  success: boolean
  data?: PriceResult & { provider?: string }
  rateLimited?: boolean
}

function buildPrompt(body: PricePredictRequest, historyInfo: string): string {
  return `You are a logistics pricing expert for the Indian freight market.
Given the following shipment details, suggest a fair price per tonne in INR.

Route: ${body.originCity}${body.originState ? `, ${body.originState}` : ""} → ${body.destinationCity}${body.destinationState ? `, ${body.destinationState}` : ""}
Weight: ${body.weightTonnes} tonnes
Vehicle Type: ${body.vehicleType || "Not specified"}
${historyInfo}

Return ONLY a JSON object (no markdown, no explanation outside the JSON):
{
  "recommendedPrice": number,
  "range": { "min": number, "max": number },
  "confidence": "high" | "medium" | "low",
  "trend": "rising" | "falling" | "stable",
  "reasoning": "one-line explanation"
}

Consider: route distance, seasonal factors, typical Indian freight rates, fuel costs.`
}

function parseAIResponse(text: string): PriceResult | null {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

async function geminiProvider(body: PricePredictRequest, prompt: string): Promise<ProviderResult> {
  const apiKey = getEnv("GEMINI_API_KEY")
  if (!apiKey) return { success: false, rateLimited: false }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (res.status === 429) return { success: false, rateLimited: true }
    if (!res.ok) return { success: false, rateLimited: res.status >= 500 }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return { success: false, rateLimited: false }

    const parsed = parseAIResponse(text)
    if (!parsed) return { success: false, rateLimited: false }

    return { success: true, data: parsed }
  } catch {
    return { success: false, rateLimited: false }
  }
}

async function groqProvider(body: PricePredictRequest, prompt: string): Promise<ProviderResult> {
  const apiKey = getEnv("GROQ_API_KEY")
  if (!apiKey) return { success: false, rateLimited: false }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 500,
      }),
    })

    if (res.status === 429) return { success: false, rateLimited: true }
    if (!res.ok) return { success: false, rateLimited: false }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    if (!text) return { success: false, rateLimited: false }

    const parsed = parseAIResponse(text)
    if (!parsed) return { success: false, rateLimited: false }

    return { success: true, data: parsed }
  } catch {
    return { success: false, rateLimited: false }
  }
}

async function openRouterProvider(body: PricePredictRequest, prompt: string): Promise<ProviderResult> {
  const apiKey = getEnv("OPENROUTER_API_KEY")
  if (!apiKey) return { success: false, rateLimited: false }

  const models = [
    "cognitivecomputations/dolphin3.0-mistral-24b:free",
    "microsoft/phi-3-mini-4k-instruct:free",
  ]

  for (const model of models) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://loadsaathi.app",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: `${prompt}\n\nReturn ONLY valid JSON.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      })

      if (res.status === 429) continue
      if (!res.ok) continue

      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content
      if (!text) continue

      const parsed = parseAIResponse(text)
      if (parsed) return { success: true, data: parsed }
    } catch {
      continue
    }
  }

  return { success: false, rateLimited: false }
}

function localFallback(
  body: PricePredictRequest,
  historicalLoads: number | null,
  historicalAvgPrice: number | null,
): PriceResult & { provider: string } {
  const weight = body.weightTonnes

  if (historicalAvgPrice && historicalLoads && historicalLoads > 0) {
    const base = historicalAvgPrice
    const range = Math.round(base * 0.15)
    return {
      recommendedPrice: base,
      range: { min: base - range, max: base + range },
      confidence: "medium",
      trend: "stable",
      reasoning: `Based on ${historicalLoads} historical load(s) on this route.`,
      provider: "data",
    }
  }

  const baseRate = weight >= 20 ? 2500 : weight >= 10 ? 3000 : 4000
  const price = baseRate
  const spread = Math.round(price * 0.2)
  return {
    recommendedPrice: price,
    range: { min: price - spread, max: price + spread },
    confidence: "low",
    trend: "stable",
    reasoning: `Estimated at ₹${price}/t based on typical rates for ${weight}t load.`,
    provider: "data",
  }
}

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

Deno.serve(async (req: Request) => {
  const headers = getCorsHeaders(req)
  const requestId = generateRequestId()

  if (req.method === "OPTIONS") {
    return optionsResponse(headers)
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405, headers, requestId)
  }

  // Require valid JWT
  const token = extractBearerToken(req)
  if (!token) {
    return errorResponse("Unauthorized", 401, headers, requestId)
  }
  const authUser = await verifyJwt(token)
  if (!authUser) {
    return errorResponse("Invalid or expired token", 401, headers, requestId)
  }

  // Rate limit by IP
  const ip = getRequestIp(req)
  if (!checkRateLimit(ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return errorResponse("Rate limit exceeded. Try again in 1 minute.", 429, headers, requestId)
  }

  try {
    const body: PricePredictRequest = await req.json()

    if (!body.originCity || !body.destinationCity || !body.weightTonnes) {
      return errorResponse("Missing required fields: originCity, destinationCity, weightTonnes", 400, headers, requestId)
    }

    let historyInfo = ""
    let historicalLoads: number | null = null
    let historicalAvgPrice: number | null = null

    const supabaseUrl = getEnv("SUPABASE_URL")
    const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")
    if (supabaseUrl && supabaseKey) {
      try {
        const url = `${supabaseUrl}/rest/v1/rpc/get_route_history`
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            p_origin: body.originCity,
            p_dest: body.destinationCity,
          }),
        })
        if (res.ok) {
          const rows: HistoryRow[] = await res.json()
          if (rows.length > 0) {
            const prices = rows.map((r) => r.price_per_tonne)
            const avg = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0)
            const min = Math.min(...prices)
            const max = Math.max(...prices)
            historicalLoads = prices.length
            historicalAvgPrice = parseFloat(avg)
            historyInfo = `Historical data: ₹${min}–${max}/t (avg ₹${avg}) from ${prices.length} loads on this route`
          }
        }
      } catch {
        // history is optional
      }
    }

    const prompt = buildPrompt(body, historyInfo)

    const providers: { name: string; fn: (b: PricePredictRequest, p: string) => Promise<ProviderResult> }[] = [
      { name: "Gemini", fn: geminiProvider },
      { name: "Groq", fn: groqProvider },
      { name: "OpenRouter", fn: openRouterProvider },
    ]

    for (const { name, fn } of providers) {
      const result = await fn(body, prompt)
      if (result.success && result.data) {
        return new Response(
          JSON.stringify({
            ...result.data,
            historicalLoads,
            historicalAvgPrice,
            provider: name,
          }),
          { status: 200, headers },
        )
      }
    }

    const fallback = localFallback(body, historicalLoads, historicalAvgPrice)
    return new Response(
      JSON.stringify({
        ...fallback,
        historicalLoads,
        historicalAvgPrice,
      }),
      { status: 200, headers },
    )
  } catch (err) {
    console.error(`[${requestId}] Price predict error:`, err)
    return errorResponse("Internal server error", 500, headers, requestId)
  }
})
