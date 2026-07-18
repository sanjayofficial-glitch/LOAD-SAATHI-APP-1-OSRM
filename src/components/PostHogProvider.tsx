import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { posthog } from '@/utils/posthog'
import { type ReactNode } from 'react'

export function PostHogProvider({ children }: { children: ReactNode }) {
  if (!import.meta.env.VITE_POSTHOG_API_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
