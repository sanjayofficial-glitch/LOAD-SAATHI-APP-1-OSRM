# LoadSaathi — Shared Freight Marketplace

India's AI-powered shared freight marketplace for PTL/LTL loads on East India industrial corridors.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Auth:** Clerk
- **Database:** Supabase (PostgreSQL + RLS)
- **State:** Tanstack React Query
- **Maps:** Leaflet + React-Leaflet
- **Analytics:** PostHog, Vercel Analytics, Google Analytics

## Setup

```bash
pnpm install
cp .env.example .env
# Fill in your keys in .env
pnpm dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_POSTHOG_API_KEY` | PostHog analytics key |
| `VITE_POSTHOG_HOST` | PostHog host URL |
| `VITE_ADMIN_USER_ID` | (Optional) Admin user ID |

See `.env.example` for all variables. **Never commit `.env` or `.env.local`**.

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
```

## Architecture

```
src/
├── components/    # Reusable UI components (shadcn/ui)
├── contexts/      # React context providers (Auth)
├── hooks/         # Custom React hooks
├── integrations/  # Third-party service clients (Supabase)
├── lib/           # Utility functions and helpers
├── pages/         # Route-level page components
│   ├── admin/     # Admin dashboard pages
│   ├── blog/      # Blog pages
│   ├── public/    # Public marketing pages
│   ├── screens/   # Feature preview screens
│   ├── shipper/   # Shipper dashboard pages
│   └── trucker/   # Trucker dashboard pages
├── theme/         # Theme configuration
├── types/         # TypeScript type definitions
└── utils/         # Utility functions (chat, notifications, etc.)

supabase/
└── functions/     # Supabase Edge Functions (Deno)
```

## Testing

Tests use Vitest + React Testing Library. Run with:

```bash
pnpm test
```

## Deployment

Deployed on Vercel. Environment variables must be configured in the Vercel dashboard.
