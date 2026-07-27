import posthog from 'posthog-js'

const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST

if (POSTHOG_API_KEY && POSTHOG_HOST) {
  posthog.init(POSTHOG_API_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: 'https://us.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    capture_exceptions: true,
    persistence: 'localStorage+cookie',
    loaded: (ph) => {
      ph.loadToolbar({
        action: 'ph_authorize',
        token: POSTHOG_API_KEY,
        toolbarVersion: 'toolbar',
        instrument: true,
        dataAttributes: ['data-attr'],
      })
    },
  })
}

export { posthog }
