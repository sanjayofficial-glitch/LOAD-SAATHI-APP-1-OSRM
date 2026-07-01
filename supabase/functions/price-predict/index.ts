const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? ""

interface PricePredictRequest {
  originCity: string
  destinationCity: string
  originState?: string
  destinationState?: string
  weightTonnes: number
  vehicleType?: string
  historicalAvg?: number
  historicalMin?: number
  historicalMax?: number
  historicalCount?: number
}

Deno.serve(async (req: Request) => {
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
    const body: PricePredictRequest = await req.json()

    if (!body.originCity || !body.destinationCity || !body.weightTonnes) {
      return new Response(JSON.stringify({ error: "Missing required fields: originCity, destinationCity, weightTonnes" }), {
        status: 400,
        headers,
      })
    }

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers,
      })
    }

    const prompt = `
You are a logistics pricing expert for the Indian freight market.
Given the following shipment details, suggest a fair price per tonne in INR.

Route: ${body.originCity}${body.originState ? `, ${body.originState}` : ""} → ${body.destinationCity}${body.destinationState ? `, ${body.destinationState}` : ""}
Weight: ${body.weightTonnes} tonnes
Vehicle Type: ${body.vehicleType || "Not specified"}
${body.historicalCount ? `Historical data: ₹${body.historicalMin}–${body.historicalMax}/t (avg ₹${body.historicalAvg}) from ${body.historicalCount} loads` : ""}

Return ONLY a JSON object (no markdown, no explanation outside the JSON):
{
  "recommendedPrice": number,
  "range": { "min": number, "max": number },
  "confidence": "high" | "medium" | "low",
  "trend": "rising" | "falling" | "stable",
  "reasoning": "one-line explanation"
}

Consider: route distance, seasonal factors, typical Indian freight rates, fuel costs.
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
      }
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
    console.error("Price predict error:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    })
  }
})
