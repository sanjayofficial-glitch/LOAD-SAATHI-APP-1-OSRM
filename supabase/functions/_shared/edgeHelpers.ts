// Shared utilities for Supabase Edge Functions
// Import as: import { getCorsHeaders, checkRateLimit, ... } from "../_shared/edgeHelpers.ts";

const ALLOWED_ORIGINS = [
  "https://loadsaathi.app",
  "https://www.loadsaathi.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

// --- CORS ---

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
}

// --- Request ID ---

export function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

// --- IP Extraction ---

export function getRequestIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// --- Rate Limiting ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// --- Bearer Token Extraction ---

export function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

// --- Error Responses ---

export function errorResponse(
  message: string,
  status: number,
  headers: Record<string, string>,
  requestId?: string,
): Response {
  const body: Record<string, string> = { error: message };
  if (requestId) body.requestId = requestId;
  return new Response(JSON.stringify(body), { status, headers });
}

export function optionsResponse(headers: Record<string, string>): Response {
  return new Response(null, { status: 204, headers });
}

// --- JWT Verification via Supabase ---

export async function verifyJwt(
  token: string,
): Promise<{ userId: string; email?: string } | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return { userId: user.id, email: user.email };
  } catch {
    return null;
  }
}
