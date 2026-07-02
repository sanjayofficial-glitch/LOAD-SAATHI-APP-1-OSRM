const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? ""
const ALLOWED_ORIGINS = ["https://loadsaathi.app", "https://www.loadsaathi.app", "http://localhost:8080", "http://localhost:5173"]

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? ""
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  }
}

function verifyAuth(req: Request): string | null {
  const auth = req.headers.get("Authorization")
  if (!auth?.startsWith("Bearer ")) return null
  return auth.slice(7)
}

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

// Simple in-memory rate limiter: max 20 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

Deno.serve(async (req: Request) => {
  const headers = getCorsHeaders(req)

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    })
  }

  // Require valid Supabase JWT
  const token = verifyAuth(req)
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers,
    })
  }

  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in 1 minute." }), {
      status: 429,
      headers,
    })
  }

  try {
    const body: MatchRequest = await req.json()

    if (!body.shipmentOriginCity || !body.shipmentDestCity ||
        !body.tripOriginCity || !body.tripDestCity) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: origin/destination cities" }),
        { status: 400, headers },
      )
    }

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers,
      })
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
      console.error("Gemini API error:", response.status, errorText)
      return new Response(JSON.stringify({ error: "Gemini API request failed" }), {
        status: response.status,
        headers,
      })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return new Response(JSON.stringify({ error: "Empty response from Gemini" }), {
        status: 500,
        headers,
      })
    }

    const jsonString = text.replace(/```json|```/g, "").trim()
    const result = JSON.parse(jsonString)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers,
    })
  } catch (err) {
    console.error("Match-ML error:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    })
  }
})
