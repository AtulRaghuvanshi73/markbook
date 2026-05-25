# markbook

A personal bookmark manager. Sign in with Google, save links with titles, and manage them on a private dashboard. Data lives in Supabase with row-level security so each user only sees their own bookmarks.

**Live app:** https://markbook-bice.vercel.app/

**Repo:** https://github.com/AtulRaghuvanshi73/markbook

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| Auth & database | Supabase (Auth, Postgres, Realtime) |
| Deployment | Vercel |

## Bonus feature

### Search and filter bookmarks

The take-home asks for one small feature that meaningfully improves the product. I chose **instant search** over the bookmark list.

**What it does**

- A search field on the dashboard filters bookmarks by **title** or **URL** as you type (client-side, no extra API calls).
- Shows how many results match when a query is active (e.g. “2 of 8 match”).
- A dedicated **No matches** empty state when the filter returns nothing, separate from the “no bookmarks yet” state.

**Why this feature**

Bookmark lists grow quickly. Without search, users scroll or mentally scan every row. Search is the highest-leverage addition for a bookmark app: it is easy to demo, works entirely on data already loaded, and mirrors how people actually find saved links. Sorting and copy-to-clipboard help too, but search solves the core “where is that link?” problem first.

**Implementation**

- UI: `components/BookmarkToolbar.tsx`
- Logic: `filterBookmarks()` in `lib/bookmarks.ts`
- Wired in `BookmarkDashboard.tsx` via `useMemo` so filtering stays in sync with Realtime updates

### Additional enhancements (not the primary bonus)

These ship alongside search to round out day-to-day use:

| Feature | Why |
|---------|-----|
| **Sort** (newest / oldest / title A–Z) | Complements search when you want a different view of the same set |
| **Copy link** | One-click copy on each row — common action when sharing or pasting elsewhere |
| **Duplicate URL detection** | Prevents clutter; normalizes host, `www.`, and trailing slashes before comparing |
| **Dark mode** | UI polish — system preference + manual toggle, persisted in `localStorage` |

## Supabase auth and Row Level Security

### Google OAuth

- Only Google sign-in (no email/password). `LoginPage` calls `signInWithOAuth({ provider: "google" })` with `redirectTo` from `lib/site-url.ts`.
- `app/auth/callback/route.ts` exchanges the OAuth `code` for a session via `exchangeCodeForSession`.
- `proxy.ts` refreshes the session on each request and redirects unauthenticated users away from `/dashboard`.

### RLS policies

Policies are defined in `supabase-schema.sql` and enforced in Postgres — not only in the UI.

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view their own bookmarks | `SELECT` | `auth.uid() = user_id` |
| Users can insert their own bookmarks | `INSERT` | `WITH CHECK (auth.uid() = user_id)` |
| Users can delete their own bookmarks | `DELETE` | `auth.uid() = user_id` |

**Why this is correct**

- Every row is tied to `auth.users(id)` via `user_id`.
- `auth.uid()` comes from the signed-in JWT, so User A cannot read, insert, or delete User B’s rows even with direct API access.
- The anon key is safe to expose in the browser because RLS is the real gate; the frontend only hides UI the user should not see.

## Real-time sync

**What is used**

- Supabase Realtime `postgres_changes` on the `bookmarks` table.
- The table is added to the `supabase_realtime` publication in `supabase-schema.sql`.

**How it works**

In `BookmarkDashboard.tsx`:

1. Initial list is loaded on the server in `app/dashboard/page.tsx`.
2. On mount, a channel subscribes with `filter: user_id=eq.${userId}` so only the current user’s rows are streamed.
3. Handlers update local state for `INSERT`, `UPDATE`, and `DELETE`.
4. Search and sort run on that state via `useMemo`, so a new bookmark from another tab appears in the filtered view immediately.

**Subscription cleanup**

```ts
return () => {
  supabase.removeChannel(channel);
};
```

The cleanup runs when the dashboard unmounts or `userId` changes, so tabs do not leak channels.

## Architecture

### Overview

```
Browser
   │
   ├─ Server Components (pages) ──► Supabase (server client, cookies)
   │
   ├─ Client Components (forms, list, toolbar) ──► Supabase (browser client)
   │
   └─ proxy.ts (every request) ──► refresh session, route guards
```

### Directory layout

```
app/
  page.tsx                  Home: login or redirect
  dashboard/page.tsx        Protected dashboard (server-fetched bookmarks)
  auth/callback/route.ts    OAuth code exchange
  layout.tsx                Root layout, theme
components/
  LoginPage.tsx             Google sign-in
  BookmarkDashboard.tsx     State, Realtime, search/sort pipeline
  BookmarkToolbar.tsx         Search + sort controls
  BookmarkForm.tsx            Add bookmark + duplicate check
  BookmarkList.tsx          List, empty states
  BookmarkItem.tsx          Row actions: copy, open, delete
  Header.tsx                Profile + sign out + theme toggle
lib/
  bookmarks.ts              Search, sort, duplicate URL helpers
  supabase/                 Server, browser, and middleware clients
  site-url.ts               OAuth redirect URLs
  auth-redirect.ts          OAuth callback normalization
  theme.ts                  Light/dark theme
proxy.ts                    Session refresh + route protection
supabase-schema.sql         Table, RLS, Realtime publication
```

### Authentication flow

1. Guest lands on `/` → login page.
2. Google OAuth → `/auth/callback` → session cookie → `/dashboard`.
3. `proxy.ts` blocks `/dashboard` without a session and sends signed-in users from `/` to `/dashboard`.
4. If Supabase returns `?code=` on `/`, `auth-redirect.ts` forwards to `/auth/callback`.

## Problems encountered and fixes

**OAuth redirect mismatch (localhost vs production)**  
Supabase and Google require exact redirect URLs. Hard-coding production URLs broke local login. Fix: `getSiteUrl()` uses `window.location.origin` in the browser, `http://localhost:3000` in development, and `NEXT_PUBLIC_SITE_URL` only on Vercel — documented in `.env.example`.

**OAuth code landing on `/` instead of `/auth/callback`**  
Supabase sometimes redirects to the site root with `?code=`. Fix: `authCallbackRedirect()` in `proxy.ts` rewrites those requests to `/auth/callback`.

**Realtime duplicate rows after insert**  
Both the form callback and Realtime `INSERT` could add the same bookmark. Fix: dedupe by `id` in `handleBookmarkAdded` and when applying Realtime payloads.

**Theme flash on load**  
Dark/light toggled after hydration caused a flash. Fix: inline script in `layout.tsx` applies the stored or system theme before paint.

## If I had more time

- **Unique URL constraint in the database** — duplicate detection is client-side today; a unique index on `(user_id, normalized_url)` would enforce it server-side.
- **Edit bookmarks** — update title or URL in place.
- **Tags or folders** — organize beyond a flat list.
- **E2E tests** — Playwright flow for login, add, search, delete, and cross-tab Realtime.

## Local setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- Google OAuth credentials (for Supabase Auth)

### 1. Clone and install

```bash
git clone <repository-url>
cd cyan-otter
npm install
```

### 2. Configure Supabase

1. Create a project in the Supabase dashboard.
2. Open **SQL Editor** and run `supabase-schema.sql` (table, RLS, Realtime).
3. **Authentication → Providers** — enable Google with your OAuth client ID and secret.
4. **Authentication → URL Configuration** — add:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-app>/auth/callback` (after deploy)

### 3. Environment variables

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For local dev, do **not** set `NEXT_PUBLIC_SITE_URL`.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |

## Production (Vercel)

1. Deploy the repo to Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Set `NEXT_PUBLIC_SITE_URL` to your production origin (no trailing slash).
4. Add the production callback URL in Supabase (same path as local, with your domain).

