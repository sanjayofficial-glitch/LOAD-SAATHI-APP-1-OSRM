import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

export interface PricePredictionInput {
  originCity: string
  destinationCity: string
  originState?: string
  destinationState?: string
  weightTonnes: number
  vehicleType?: string
}

export interface PricePrediction {
  recommendedPrice: number
  range: { min: number; max: number }
  confidence: 'high' | 'medium' | 'low'
  trend: 'rising' | 'falling' | 'stable'
  reasoning: string
  historicalLoads?: number | null
  historicalAvgPrice?: number | null
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [value, delay])

  return debouncedValue
}

export function usePricePrediction(input: PricePredictionInput) {
  const debouncedInput = useDebounce(input, 800)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  return useQuery<PricePrediction | null>({
    queryKey: ['pricePredict', debouncedInput],
    queryFn: async () => {
      if (
        !debouncedInput.originCity ||
        !debouncedInput.destinationCity ||
        !debouncedInput.weightTonnes ||
        debouncedInput.weightTonnes <= 0
      ) {
        return null
      }

      if (!supabaseUrl) return null

      const response = await fetch(
        `${supabaseUrl}/functions/v1/price-predict`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(debouncedInput),
          signal: AbortSignal.timeout(8000),
        },
      )

      if (!response.ok) return null
      return await response.json()
    },
    enabled:
      !!debouncedInput.originCity &&
      !!debouncedInput.destinationCity &&
      debouncedInput.weightTonnes > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
