import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

serve(async (req: Request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`,
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
