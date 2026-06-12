// Supabase Edge Function: gemini-proxy
// Protects the Gemini API key from client-side exposure.
// The client sends the search query here instead of calling Gemini directly.
// Deploy with: supabase functions deploy gemini-proxy --no-verify-jwt
// Set env: supabase secrets set GEMINI_API_KEY=your_key_here

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? ""

interface SearchFilters {
  origin?: string
  destination?: string
  weight?: number
  date?: string
}

serve(async (req: Request) => {
  // CORS headers for browser access
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
    const { query } = await req.json()

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid query" }), {
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

    const today = new Date().toISOString().split("T")[0]
    const prompt = `
    Extract logistics search filters from this query: "${query}"
    
    Rules:
    1. Return ONLY a JSON object with these keys: origin, destination, weight (number in tonnes), date (YYYY-MM-DD).
    2. If the user says "now", "today", or "immediately", use "${today}" as the date.
    3. If a value is missing, omit the key.
    4. Clean city names (e.g., "delhi" -> "Delhi").
    
    Example: "I want to send 2 tonnes from Delhi to Mumbai now"
    Output: {"origin": "Delhi", "destination": "Mumbai", "weight": 2, "date": "${today}"}
    
    Current date is ${today}.
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
      return new Response(JSON.stringify({}), { status: 200, headers })
    }

    const jsonString = text.replace(/```json|```/g, "").trim()
    const filters: SearchFilters = JSON.parse(jsonString)

    return new Response(JSON.stringify(filters), {
      status: 200,
      headers,
    })
  } catch (err) {
    console.error("Gemini proxy error:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    })
  }
})
