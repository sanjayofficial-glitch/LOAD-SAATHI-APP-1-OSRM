function getEnv(name: string): string {
  return Deno.env.get(name) ?? ""
}

interface CreditScoreRow {
  score: number
  factors: Record<string, unknown>
  calculated_at: string
}

Deno.serve(async (req: Request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }

  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing required query param: userId" }), {
        status: 400,
        headers,
      })
    }

    const supabaseUrl = getEnv("SUPABASE_URL")
    const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers,
      })
    }

    const authHeader = `Bearer ${supabaseKey}`

    let score: CreditScoreRow | null = null

    const getRes = await fetch(`${supabaseUrl}/rest/v1/credit_scores?user_id=eq.${encodeURIComponent(userId)}&select=score,factors,calculated_at`, {
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: authHeader,
      },
    })

    if (getRes.ok) {
      const rows: CreditScoreRow[] = await getRes.json()
      if (rows.length > 0) {
        score = rows[0]
      }
    }

    if (!score) {
      const calcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/calculate_credit_score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: authHeader,
        },
        body: JSON.stringify({ p_user_id: userId }),
      })

      if (calcRes.ok) {
        const data = await calcRes.json()
        if (data && data.length > 0) {
          score = {
            score: data[0].score,
            factors: data[0].factors,
            calculated_at: new Date().toISOString(),
          }
        }
      }
    }

    if (!score) {
      score = {
        score: 550,
        factors: { tier: "fair" },
        calculated_at: new Date().toISOString(),
      }
    }

    return new Response(JSON.stringify(score), { status: 200, headers })
  } catch (err) {
    console.error("Credit score error:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    })
  }
})
