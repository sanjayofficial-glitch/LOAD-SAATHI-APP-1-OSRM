import { useRef, useEffect, useState, useCallback } from 'react'

export interface AIMatchResult {
  aiScore: number
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

/**
 * Fetches AI match scores for the top items in a list.
 * Only processes the first `maxItems` items, staggers calls to avoid throttling.
 */
export function useSmartMatch<T extends { id: string }>(
  items: T[],
  getParams: (item: T) => Record<string, unknown> | null,
  maxItems = 10,
) {
  const [scores, setScores] = useState<Record<string, AIMatchResult>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const fetchedRef = useRef<Set<string>>(new Set())

  const fetchScore = useCallback(async (item: T) => {
    const params = getParams(item)
    if (!params || !supabaseUrl || fetchedRef.current.has(item.id)) return null

    setLoadingId(item.id)
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/match-ml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(6000),
      })
      if (!response.ok) return null
      const data: AIMatchResult = await response.json()
      fetchedRef.current.add(item.id)
      return data
    } catch {
      fetchedRef.current.add(item.id) // Mark as attempted so we don't retry
      return null
    } finally {
      setLoadingId(null)
    }
  }, [getParams, supabaseUrl])

  useEffect(() => {
    const top = items.slice(0, maxItems)
    if (top.length === 0 || !supabaseUrl) return

    let cancelled = false

    const run = async () => {
      for (const item of top) {
        if (cancelled || fetchedRef.current.has(item.id)) continue
        const result = await fetchScore(item)
        if (result && !cancelled) {
          setScores(prev => ({ ...prev, [item.id]: result }))
        }
        await new Promise(r => setTimeout(r, 150))
      }
    }

    run()
    return () => { cancelled = true }
  }, [items, maxItems, supabaseUrl, fetchScore])

  return { scores, loadingId }
}
