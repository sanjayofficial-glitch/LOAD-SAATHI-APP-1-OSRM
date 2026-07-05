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

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? ""

interface MatchRequest {
  shipmentOriginCity: string
  shipmentDestCity: string
  tripOriginCity: string
  tripDestCity: string
  shipmentWeightTonnes: number
  tripCapacityTonnes: number
  shipmentBudgetPerTonne?: number
  tripPricePerTonne?: number
  shipmentDate?: string
  tripDate?: string
  truckerRating?: number
}

const RATE_LIMIT_MAX = 20
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

  // Require valid Supabase JWT
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
    const body: MatchRequest = await req.json()

    if (!body.shipmentOriginCity || !body.shipmentDestCity ||
        !body.tripOriginCity || !body.tripDestCity) {
      return errorResponse("Missing required fields: origin/destination cities", 400, headers, requestId)
    }

    if (!GEMINI_API_KEY) {
      return errorResponse("Gemini API key not configured", 500, headers, requestId)
    }

    const prompt = `
You are a logistics matchmaking expert for the Indian freight platform.

Trip details:
  Route: ${body.tripOriginCity} → ${body.tripDestCity}
  Available capacity: ${body.tripCapacityTonnes ?? "N/A"} tonnes
  Asking price: ₹${body.tripPricePerTonne ?? "N/A"}/tonne
  Departure: ${body.tripDate ?? "N/A"}
  Trucker rating: ${body.truckerRating ?? "N/A"}/5

Shipment details:
  Route: ${body.shipmentOriginCity} → ${body.shipmentDestCity}
  Weight: ${body.shipmentWeightTonnes} tonnes
  Budget: ₹${body.shipmentBudgetPerTonne ?? "N/A"}/tonne
  Ready date: ${body.shipmentDate ?? "N/A"}

Evaluate match quality. Consider route alignment, price compatibility, capacity fit, timing, and reliability.

Return ONLY valid JSON (no markdown):
{
  "aiScore": number 0–100,
  "confidence": "high" | "medium" | "low",
  "reasoning": "one-line explanation of the key factor driving this score"
}
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[${requestId}] Gemini API error:`, response.status, errorText)
      return errorResponse("Gemini API request failed", response.status, headers, requestId)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return errorResponse("Empty response from Gemini", 500, headers, requestId)
    }

    const jsonString = text.replace(/```json|```/g, "").trim()
    const result = JSON.parse(jsonString)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers,
    })
  } catch (err) {
    console.error(`[${requestId}] Match-ML error:`, err)
    return errorResponse("Internal server error", 500, headers, requestId)
  }
})
