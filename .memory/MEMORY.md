# User Operating Patterns — sanja

## Preferences
- **Project path:** `C:\Users\sanja\dyad-apps\LOAD-SAATHI-APP-1 copy`
- **Package manager:** pnpm (has pnpm-lock.yaml, use pnpm not npm)
- **Shell:** bash on Windows (via Git Bash or similar)
- **CLI tool usage:** Prefers npx for global tools (e.g., `npx supabase` rather than installing globally)
- **Quality standard:** Expects `vite build` to pass with zero errors before considering work done

## Communication Patterns
- Provides detailed specs via pasted text files with checklists
- Prefers being asked about risky decisions before implementation
- Responds with brief instructions ("Go as best way", "check this")
- Provides credentials and keys directly in chat when needed

## Known Preferences
- Uses Clerk for auth (not Supabase Auth)
- Uses OpenStreetMap-based services (Nominatim, OSRM) — no Google Maps, Mapbox, or paid map services
- Uses shadcn/ui components extensively
- Prefers Tailwind CSS for all styling
- Does not want in-app chat — uses WhatsApp deep links instead

## Lessons Learned
- When refactoring large codebases, audit first, act second
- Always check for duplicate/near-duplicate files before creating new ones
- Don't assume a file is dead code until you've verified it's not imported anywhere
- Supabase Realtime subscriptions need the anonymous client, not the authenticated one
- Always verify build passes after env changes
- Use `start /B` or background processes for dev servers on Windows
