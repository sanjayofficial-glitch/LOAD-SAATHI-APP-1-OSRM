// Supabase Edge Function: gemini-proxy
// Protects the Gemini API key from client-side exposure.
// The client sends the search query here instead of calling Gemini directly.
// Deploy with: supabase functions deploy gemini-proxy
// Set env: supabase secrets set GEMINI_API_KEY=your_key_here

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

interface SearchFilters {
  origin?: string
  destination?: string
  weight?: number
  date?: string
}

const RATE_LIMIT_MAX = 5
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
    const { query } = await req.json()

    if (!query || typeof query !== "string") {
      return errorResponse("Missing or invalid query", 400, headers, requestId)
    }

    if (!GEMINI_API_KEY) {
      return errorResponse("Gemini API key not configured", 500, headers, requestId)
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
      console.error(`[${requestId}] Gemini API error:`, response.status, errorText)
      return errorResponse("Gemini API request failed", response.status, headers, requestId)
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
    console.error(`[${requestId}] Gemini proxy error:`, err)
    return errorResponse("Internal server error", 500, headers, requestId)
  }
})
