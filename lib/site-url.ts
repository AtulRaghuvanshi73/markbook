/**
 * OAuth / redirect URLs should match where the user is actually browsing.
 *
 * - Local dev: uses window.location.origin (localhost) — do NOT set
 *   NEXT_PUBLIC_SITE_URL in .env.local
 * - Vercel: set NEXT_PUBLIC_SITE_URL only in the Vercel dashboard
 */
export function getSiteUrl(): string {
  // Browser: always use the tab the user is on (localhost vs production)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Local `next dev` — never use production URL from env
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Production server (Vercel build / SSR)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}

/** Redirect base after OAuth — same host that received the callback */
export function getRequestOrigin(request: Request): string {
  return new URL(request.url).origin;
}
