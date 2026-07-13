# Graph Report - .  (2026-07-13)

## Corpus Check
- 163 files · ~102,783 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 570 nodes · 803 edges · 37 communities detected
- Extraction: 74% EXTRACTED · 25% INFERRED · 1% AMBIGUOUS · INFERRED: 200 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core CRUD Operations|Core CRUD Operations]]
- [[_COMMUNITY_Shared Components & Pages|Shared Components & Pages]]
- [[_COMMUNITY_Auth & Dashboard Layer|Auth & Dashboard Layer]]
- [[_COMMUNITY_Database Functions|Database Functions]]
- [[_COMMUNITY_UI Component Library|UI Component Library]]
- [[_COMMUNITY_AI & Credit Integration|AI & Credit Integration]]
- [[_COMMUNITY_AI Provider Chain|AI Provider Chain]]
- [[_COMMUNITY_Admin Monitoring|Admin Monitoring]]
- [[_COMMUNITY_Auth Hooks & Routes|Auth Hooks & Routes]]
- [[_COMMUNITY_Edge Functions|Edge Functions]]
- [[_COMMUNITY_Geocoding & Routing|Geocoding & Routing]]
- [[_COMMUNITY_Marketing Pages|Marketing Pages]]
- [[_COMMUNITY_AI Prompt Building|AI Prompt Building]]
- [[_COMMUNITY_Build Configuration|Build Configuration]]
- [[_COMMUNITY_Error Handling|Error Handling]]
- [[_COMMUNITY_Map Coordinates|Map Coordinates]]
- [[_COMMUNITY_Tech Stack Dependencies|Tech Stack Dependencies]]
- [[_COMMUNITY_PWA & SEO|PWA & SEO]]
- [[_COMMUNITY_Theme System|Theme System]]
- [[_COMMUNITY_Match Scoring|Match Scoring]]
- [[_COMMUNITY_Matching Utilities|Matching Utilities]]
- [[_COMMUNITY_Text Parsing|Text Parsing]]
- [[_COMMUNITY_Price Prediction|Price Prediction]]
- [[_COMMUNITY_Blog Module|Blog Module]]
- [[_COMMUNITY_Workspace Config|Workspace Config]]
- [[_COMMUNITY_Preview Components|Preview Components]]
- [[_COMMUNITY_App Icons|App Icons]]
- [[_COMMUNITY_Vite Types|Vite Types]]
- [[_COMMUNITY_Empty State|Empty State]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Skeleton Loader|Skeleton Loader]]
- [[_COMMUNITY_Class Utility|Class Utility]]
- [[_COMMUNITY_Theme Provider|Theme Provider]]
- [[_COMMUNITY_Chat Types|Chat Types]]
- [[_COMMUNITY_Chart Theme|Chart Theme]]
- [[_COMMUNITY_404 Page|404 Page]]
- [[_COMMUNITY_Chat Preview|Chat Preview]]

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

### Community 0 - "Core CRUD Operations"
Cohesion: 0.06
Nodes (49): markAllAsRead(), handleSubmit(), initChat(), fetchConversations(), handleRoleSelection(), fetchReviews(), fetchStats(), handleSwitchRole() (+41 more)

### Community 1 - "Shared Components & Pages"
Cohesion: 0.08
Nodes (49): AI Insights Card, Authentication Context, AuthContext and AuthProvider, Breadcrumb Navigation, Chat Page, Chat List Page, Chat Message interface, Choose Role Page (+41 more)

### Community 2 - "Auth & Dashboard Layer"
Cohesion: 0.12
Nodes (42): AuthContext Provider, Auth Sync Router, BrowseShipments Component, BrowseTrips TripList Component, CreditScorePreview Component, ShipperDashboard Component, TruckerDashboard Component, EditShipment Component (+34 more)

### Community 3 - "Database Functions"
Cohesion: 0.16
Nodes (16): calculate_credit_score(), create_notification(), refresh_credit_score(), update_shipper_rating(), update_trucker_rating(), credit_scores table, messages table, ml_match_log table (+8 more)

### Community 4 - "UI Component Library"
Cohesion: 0.13
Nodes (27): cn utility, Accordion, Alert, AlertDialog, Avatar, Badge, Button, Card (+19 more)

### Community 5 - "AI & Credit Integration"
Cohesion: 0.13
Nodes (28): AIInsights Component, AuthContext (Clerk Wrapper), calculate_credit_score() PG Function, Chat Module, ChooseRole Page, Clerk Authentication, credit-insights Edge Function, CreditScoreBadge Component (+20 more)

### Community 6 - "AI Provider Chain"
Cohesion: 0.12
Nodes (5): geminiProvider(), getEnv(), groqProvider(), openRouterProvider(), parseAIResponse()

### Community 7 - "Admin Monitoring"
Cohesion: 0.15
Nodes (21): Admin Dashboard, Business Metrics Panel, Business Metrics Props Interface, Event Interface, Live Event Feed, Content Moderation, Monitoring Command Center, MonitoringDashboard Events Interface (+13 more)

### Community 8 - "Auth Hooks & Routes"
Cohesion: 0.13
Nodes (7): RoleProtectedRoute(), useAuth(), useCreditInsights(), useCreditScore(), ShipperHistory(), EditTrip(), TruckerHistory()

### Community 9 - "Edge Functions"
Cohesion: 0.2
Nodes (13): Google Gemini API, Groq API, OpenRouter API, credit-insights/index.ts, credit-score/index.ts, _shared/edgeHelpers.ts, gemini-proxy/index.ts, match-ml/index.ts (+5 more)

### Community 10 - "Geocoding & Routing"
Cohesion: 0.23
Nodes (7): loadMapData(), saveCoords(), geocodeCity(), throttledFetch(), cacheKey(), evictOldest(), getRoute()

### Community 11 - "Marketing Pages"
Cohesion: 0.25
Nodes (11): About Page, Contact Page, FAQ Page, Features Page, How It Works Page, Pricing Page, Privacy Policy, Safety & Trust Page (+3 more)

### Community 12 - "AI Prompt Building"
Cohesion: 0.57
Nodes (6): buildPrompt(), geminiProvider(), getEnv(), groqProvider(), openRouterProvider(), parseAIResponse()

### Community 13 - "Build Configuration"
Cohesion: 0.43
Nodes (7): App Component (Root Router), ESLint Configuration, Application Entry Point, PostCSS Configuration, Service Worker (Offline Cache), Tailwind CSS Configuration, Vite Build Configuration

### Community 14 - "Error Handling"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 16 - "Map Coordinates"
Cohesion: 0.4
Nodes (2): getCityCoords(), resolveCoords()

### Community 17 - "Tech Stack Dependencies"
Cohesion: 0.33
Nodes (6): lucide-react Icons, Radix UI Primitives, React Router, React TypeScript Tech Stack, shadcn/ui Component Library, Tailwind CSS

### Community 18 - "PWA & SEO"
Cohesion: 0.33
Nodes (6): Google Search Console Verification, LoadSaathi PWA Entry Point, src/main.tsx Entry Module, PWA Manifest, Service Worker Registration, robots.txt - Search Engine Crawl Rules

### Community 21 - "Theme System"
Cohesion: 0.4
Nodes (2): ThemedToaster(), useTheme()

### Community 22 - "Match Scoring"
Cohesion: 0.5
Nodes (2): calculateMatchScore(), haversineKm()

### Community 23 - "Matching Utilities"
Cohesion: 0.4
Nodes (5): calculateMatchScore function, geocodeCity function, getAIMatchBadge function, getMatchLabel function, getRoute OSRM function

### Community 26 - "Text Parsing"
Cohesion: 0.83
Nodes (3): capitalize(), parseNaturalLanguageSearch(), parseWithRegex()

### Community 27 - "Price Prediction"
Cohesion: 1.0
Nodes (2): useDebounce(), usePricePrediction()

### Community 31 - "Blog Module"
Cohesion: 1.0
Nodes (3): Blog Article, Blog Articles Data, Blog List

### Community 32 - "Workspace Config"
Cohesion: 0.67
Nodes (3): Dyad App README, pnpm Build Allowlist, Dyad pnpm Workspace

### Community 53 - "Preview Components"
Cohesion: 1.0
Nodes (2): AdminPreview Component, DashboardPreview Component

### Community 54 - "App Icons"
Cohesion: 1.0
Nodes (2): Load Saathi App Icon, Image Placeholder Icon

### Community 121 - "Vite Types"
Cohesion: 1.0
Nodes (1): Vite Client Type Declarations

### Community 122 - "Empty State"
Cohesion: 1.0
Nodes (1): Empty State Placeholder

### Community 123 - "Error Boundary"
Cohesion: 1.0
Nodes (1): React Error Boundary

### Community 124 - "Skeleton Loader"
Cohesion: 1.0
Nodes (1): Landing Page Skeleton Loader

### Community 125 - "Class Utility"
Cohesion: 1.0
Nodes (1): cn class merging utility

### Community 126 - "Theme Provider"
Cohesion: 1.0
Nodes (1): ThemeProvider and useTheme

### Community 127 - "Chat Types"
Cohesion: 1.0
Nodes (1): ChatParticipant interface

### Community 128 - "Chart Theme"
Cohesion: 1.0
Nodes (1): Chart theme constants

### Community 129 - "404 Page"
Cohesion: 1.0
Nodes (1): NotFound (404) Page

### Community 130 - "Chat Preview"
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
- **60 isolated node(s):** `PostCSS Configuration`, `Vite Client Type Declarations`, `Breadcrumb Navigation`, `Empty State Placeholder`, `React Error Boundary` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Error Handling`** (6 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`, `ErrorBoundary.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Map Coordinates`** (6 nodes): `applyJitter()`, `getCityCoords()`, `MapResizer()`, `resolveAll()`, `resolveCoords()`, `TripMapComponent.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Theme System`** (5 nodes): `App()`, `ThemedToaster()`, `App.tsx`, `theme.tsx`, `useTheme()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Match Scoring`** (5 nodes): `matching.ts`, `calculateMatchScore()`, `getAIMatchBadge()`, `getMatchLabel()`, `haversineKm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Price Prediction`** (3 nodes): `useDebounce()`, `usePricePrediction()`, `usePricePrediction.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Preview Components`** (2 nodes): `AdminPreview Component`, `DashboardPreview Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Icons`** (2 nodes): `Load Saathi App Icon`, `Image Placeholder Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Types`** (1 nodes): `Vite Client Type Declarations`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Empty State`** (1 nodes): `Empty State Placeholder`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Error Boundary`** (1 nodes): `React Error Boundary`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skeleton Loader`** (1 nodes): `Landing Page Skeleton Loader`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Class Utility`** (1 nodes): `cn class merging utility`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Theme Provider`** (1 nodes): `ThemeProvider and useTheme`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat Types`** (1 nodes): `ChatParticipant interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chart Theme`** (1 nodes): `Chart theme constants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `404 Page`** (1 nodes): `NotFound (404) Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat Preview`** (1 nodes): `ChatPreview Component`
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
- **Why does `Clerk-Supabase Client Factory` connect `Auth & Dashboard Layer` to `Shared Components & Pages`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._