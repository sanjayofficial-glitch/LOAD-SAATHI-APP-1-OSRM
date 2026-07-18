# Graph Report - .  (2026-07-18)

## Corpus Check
- 187 files · ~116,884 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 588 nodes · 820 edges · 39 communities detected
- Extraction: 75% EXTRACTED · 24% INFERRED · 1% AMBIGUOUS · INFERRED: 200 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 128|Community 128]]
- [[_COMMUNITY_Community 129|Community 129]]
- [[_COMMUNITY_Community 130|Community 130]]
- [[_COMMUNITY_Community 131|Community 131]]
- [[_COMMUNITY_Community 132|Community 132]]
- [[_COMMUNITY_Community 133|Community 133]]

## God Nodes (most connected - your core abstractions)
1. `showError()` - 27 edges
2. `cn utility` - 26 edges
3. `createClerkSupabaseClient()` - 22 edges
4. `showSuccess()` - 22 edges
5. `Clerk-Supabase Client Factory` - 18 edges
6. `Digital Freight Credit Score Implementation Plan` - 17 edges
7. `Monitoring Command Center` - 16 edges
8. `sendNotification()` - 14 edges
9. `BrowseShipments Component` - 14 edges
10. `users table` - 14 edges

## Surprising Connections (you probably didn't know these)
- `markAllAsRead()` --calls--> `createClerkSupabaseClient()`  [INFERRED]
  src\components\NotificationBell.tsx → src\utils\supabaseClient.ts
- `RoleProtectedRoute()` --calls--> `useAuth()`  [INFERRED]
  src\components\RoleProtectedRoute.tsx → src\contexts\AuthContext.tsx
- `useCreditScore()` --calls--> `useAuth()`  [INFERRED]
  src\hooks\useCreditScore.ts → src\contexts\AuthContext.tsx
- `useCreditInsights()` --calls--> `useAuth()`  [INFERRED]
  src\hooks\useCreditScore.ts → src\contexts\AuthContext.tsx
- `ShipperHistory()` --calls--> `useAuth()`  [INFERRED]
  src\pages\shipper\ShipperHistory.tsx → src\contexts\AuthContext.tsx

## Hyperedges (group relationships)
- **** —  [EXTRACTED 1.00]
- **** —  [INFERRED 0.80]
- **** —  [INFERRED 0.80]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (49): markAllAsRead(), handleSubmit(), initChat(), fetchConversations(), handleRoleSelection(), fetchReviews(), fetchStats(), handleSwitchRole() (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (49): AI Insights Card, Authentication Context, AuthContext and AuthProvider, Breadcrumb Navigation, Chat Page, Chat List Page, Chat Message interface, Choose Role Page (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (42): AuthContext Provider, Auth Sync Router, BrowseShipments Component, BrowseTrips TripList Component, CreditScorePreview Component, ShipperDashboard Component, TruckerDashboard Component, EditShipment Component (+34 more)

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (16): calculate_credit_score(), create_notification(), refresh_credit_score(), update_shipper_rating(), update_trucker_rating(), credit_scores table, messages table, ml_match_log table (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (11): buildPrompt(), geminiProvider(), getEnv(), groqProvider(), openRouterProvider(), parseAIResponse(), geminiProvider(), getEnv() (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (27): cn utility, Accordion, Alert, AlertDialog, Avatar, Badge, Button, Card (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (28): AIInsights Component, AuthContext (Clerk Wrapper), calculate_credit_score() PG Function, Chat Module, ChooseRole Page, Clerk Authentication, credit-insights Edge Function, CreditScoreBadge Component (+20 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (21): Admin Dashboard, Business Metrics Panel, Business Metrics Props Interface, Event Interface, Live Event Feed, Content Moderation, Monitoring Command Center, MonitoringDashboard Events Interface (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (7): RoleProtectedRoute(), useAuth(), useCreditInsights(), useCreditScore(), ShipperHistory(), EditTrip(), TruckerHistory()

### Community 9 - "Community 9"
Cohesion: 0.2
Nodes (13): Google Gemini API, Groq API, OpenRouter API, credit-insights/index.ts, credit-score/index.ts, _shared/edgeHelpers.ts, gemini-proxy/index.ts, match-ml/index.ts (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.21
Nodes (9): loadMapData(), saveCoords(), geocodeCity(), throttledFetch(), cacheKey(), evictOldest(), getRoute(), haversineDistance() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (11): About Page, Contact Page, FAQ Page, Features Page, How It Works Page, Pricing Page, Privacy Policy, Safety & Trust Page (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.43
Nodes (7): App Component (Root Router), ESLint Configuration, Application Entry Point, PostCSS Configuration, Service Worker (Offline Cache), Tailwind CSS Configuration, Vite Build Configuration

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (2): getCityCoords(), resolveCoords()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (6): lucide-react Icons, Radix UI Primitives, React Router, React TypeScript Tech Stack, shadcn/ui Component Library, Tailwind CSS

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (6): Google Search Console Verification, LoadSaathi PWA Entry Point, src/main.tsx Entry Module, PWA Manifest, Service Worker Registration, robots.txt - Search Engine Crawl Rules

### Community 18 - "Community 18"
Cohesion: 0.4
Nodes (2): ThemedToaster(), useTheme()

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (2): calculateMatchScore(), haversineKm()

### Community 22 - "Community 22"
Cohesion: 0.4
Nodes (5): calculateMatchScore function, geocodeCity function, getAIMatchBadge function, getMatchLabel function, getRoute OSRM function

### Community 25 - "Community 25"
Cohesion: 0.83
Nodes (3): capitalize(), parseNaturalLanguageSearch(), parseWithRegex()

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (2): generateShareWhatsAppLink(), getShareUrl()

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (3): allowBuilds configuration, minimumReleaseAge setting, packages list

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (2): useDebounce(), usePricePrediction()

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (3): Blog Article, Blog Articles Data, Blog List

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (3): Dyad App README, pnpm Build Allowlist, Dyad pnpm Workspace

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (2): calculateEmissions(), getVehicleEmissionClass()

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (2): AdminPreview Component, DashboardPreview Component

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (2): Load Saathi App Icon, Image Placeholder Icon

### Community 124 - "Community 124"
Cohesion: 1.0
Nodes (1): Vite Client Type Declarations

### Community 125 - "Community 125"
Cohesion: 1.0
Nodes (1): Empty State Placeholder

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (1): React Error Boundary

### Community 127 - "Community 127"
Cohesion: 1.0
Nodes (1): Landing Page Skeleton Loader

### Community 128 - "Community 128"
Cohesion: 1.0
Nodes (1): cn class merging utility

### Community 129 - "Community 129"
Cohesion: 1.0
Nodes (1): ThemeProvider and useTheme

### Community 130 - "Community 130"
Cohesion: 1.0
Nodes (1): ChatParticipant interface

### Community 131 - "Community 131"
Cohesion: 1.0
Nodes (1): Chart theme constants

### Community 132 - "Community 132"
Cohesion: 1.0
Nodes (1): NotFound (404) Page

### Community 133 - "Community 133"
Cohesion: 1.0
Nodes (1): ChatPreview Component

## Ambiguous Edges - Review These
- `Review Submission Dialog` → `Star Rating Icon`  [AMBIGUOUS]
  src/components/ReviewDialog.tsx · relation: conceptually_related_to
- `Network Status Hook` → `useIsMobile hook`  [AMBIGUOUS]
  src/hooks/use-mobile.tsx · relation: conceptually_related_to
- `Price Prediction Hook` → `useCreditScore hook`  [AMBIGUOUS]
  src/hooks/usePricePrediction.ts · relation: conceptually_related_to
- `Chat Message interface` → `Message type`  [AMBIGUOUS]
  src/types/index.ts · relation: conceptually_related_to
- `Chat utility functions` → `generateWhatsAppLink function`  [AMBIGUOUS]
  src/utils/whatsapp.ts · relation: conceptually_related_to
- `calculateMatchScore function` → `getRoute OSRM function`  [AMBIGUOUS]
  src/utils/osrm.ts · relation: conceptually_related_to

## Knowledge Gaps
- **63 isolated node(s):** `PostCSS Configuration`, `Vite Client Type Declarations`, `Breadcrumb Navigation`, `Empty State Placeholder`, `React Error Boundary` (+58 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (6 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`, `ErrorBoundary.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (6 nodes): `applyJitter()`, `getCityCoords()`, `MapResizer()`, `resolveAll()`, `resolveCoords()`, `TripMapComponent.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (5 nodes): `App()`, `ThemedToaster()`, `App.tsx`, `theme.tsx`, `useTheme()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (5 nodes): `matching.ts`, `calculateMatchScore()`, `getAIMatchBadge()`, `getMatchLabel()`, `haversineKm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (4 nodes): `whatsapp.ts`, `generateShareWhatsAppLink()`, `generateWhatsAppLink()`, `getShareUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (3 nodes): `useDebounce()`, `usePricePrediction()`, `usePricePrediction.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `emissions.ts`, `calculateEmissions()`, `getVehicleEmissionClass()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (2 nodes): `AdminPreview Component`, `DashboardPreview Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (2 nodes): `Load Saathi App Icon`, `Image Placeholder Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 124`** (1 nodes): `Vite Client Type Declarations`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (1 nodes): `Empty State Placeholder`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (1 nodes): `React Error Boundary`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 127`** (1 nodes): `Landing Page Skeleton Loader`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 128`** (1 nodes): `cn class merging utility`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 129`** (1 nodes): `ThemeProvider and useTheme`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (1 nodes): `ChatParticipant interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 131`** (1 nodes): `Chart theme constants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 132`** (1 nodes): `NotFound (404) Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 133`** (1 nodes): `ChatPreview Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Review Submission Dialog` and `Star Rating Icon`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Network Status Hook` and `useIsMobile hook`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Price Prediction Hook` and `useCreditScore hook`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Chat Message interface` and `Message type`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Chat utility functions` and `generateWhatsAppLink function`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `calculateMatchScore function` and `getRoute OSRM function`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Clerk-Supabase Client Factory` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._