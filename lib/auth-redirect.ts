import type { NextRequest } from "next/server";

/** Supabase sometimes lands OAuth codes on `/` instead of `/auth/callback`. */
export function authCallbackRedirect(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code || request.nextUrl.pathname !== "/") {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  url.search = `code=${encodeURIComponent(code)}`;

  const next = request.nextUrl.searchParams.get("next");
  if (next) {
    url.search += `&next=${encodeURIComponent(next)}`;
  }

  return url;
}
