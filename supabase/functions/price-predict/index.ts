const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

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

    let historyInfo = ""
    let historicalLoads: number | null = null
    let historicalAvgPrice: number | null = null
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/rpc/get_route_history`
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            p_origin: body.originCity,
            p_dest: body.destinationCity,
          }),
        })
        if (res.ok) {
          const rows: HistoryRow[] = await res.json()
          if (rows.length > 0) {
            const prices = rows.map(r => r.price_per_tonne)
            const avg = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0)
            const min = Math.min(...prices)
            const max = Math.max(...prices)
            historicalLoads = prices.length
            historicalAvgPrice = parseFloat(avg)
            historyInfo = `Historical data: ₹${min}–${max}/t (avg ₹${avg}) from ${prices.length} loads on this route`
          }
        }
      } catch {
        // history is optional — silently continue
      }
    }

    const prompt = `
You are a logistics pricing expert for the Indian freight market.
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

    return new Response(JSON.stringify({
      ...result,
      historicalLoads,
      historicalAvgPrice,
    }), {
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
