# markbook

A personal bookmark manager. Sign in with Google, save links with titles, and view them on a private dashboard. Data is stored in Supabase with row-level security so each user only sees their own bookmarks.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| Auth & database | Supabase (Auth, Postgres, Realtime) |
| Deployment | Vercel (optional) |

## Architecture

### Overview

```
Browser
   │
   ├─ Server Components (pages) ──► Supabase (server client, cookies)
   │
   ├─ Client Components (forms, list) ──► Supabase (browser client)
   │
   └─ proxy.ts (every request) ──► refresh session, route guards
```

The app uses the Next.js App Router. Server components load the signed-in user and initial bookmark list. Client components handle login, form submission, deletes, and live updates. A single `proxy.ts` file runs on each request to keep the auth session fresh and enforce access rules.

### Directory layout

```
app/
  page.tsx              Home: login or redirect to dashboard
  dashboard/page.tsx    Protected bookmark UI (server-fetched data)
  auth/callback/route.ts OAuth code exchange
  layout.tsx            Root layout, theme provider
components/
  LoginPage.tsx         Google sign-in
  BookmarkDashboard.tsx List + Realtime subscription
  BookmarkForm.tsx      Create bookmarks
  BookmarkList.tsx      Display and delete
  Header.tsx            User menu and sign out
lib/
  supabase/
    server.ts           Server-side Supabase client (cookies)
    client.ts           Browser Supabase client
    middleware.ts       Session refresh and redirects
  site-url.ts           OAuth redirect URL helpers
  auth-redirect.ts      Normalizes OAuth callback URLs
  theme.ts              Light/dark theme utilities
proxy.ts                Request proxy (session + route protection)
supabase-schema.sql     Table, indexes, RLS policies, Realtime
```

### Authentication flow

1. Unauthenticated users land on `/` and see the login page.
2. **Continue with Google** starts Supabase OAuth; the redirect target is `/auth/callback` on the current origin (localhost in dev).
3. `app/auth/callback/route.ts` exchanges the `code` for a session and redirects to `/dashboard`.
4. `proxy.ts` calls `updateSession` on every matched request: refreshes cookies, blocks `/dashboard` for guests, and sends signed-in users away from `/` to `/dashboard`.
5. If Supabase returns the OAuth `code` on `/` instead of `/auth/callback`, `auth-redirect.ts` rewrites the request to the callback route.

### Data model

The `bookmarks` table stores `id`, `user_id`, `url`, `title`, and `created_at`. Row Level Security limits all operations to rows where `auth.uid() = user_id`.

- **Read path:** `dashboard/page.tsx` loads bookmarks on the server, ordered newest first.
- **Write path:** `BookmarkForm` inserts via the browser client; deletes go through `BookmarkList`.
- **Live updates:** `BookmarkDashboard` subscribes to Supabase Realtime on `bookmarks` filtered by `user_id`, so the list stays in sync across tabs without a full reload.

### Theming

Light and dark mode use a small inline script in `layout.tsx` to avoid a flash of the wrong theme, plus `ThemeProvider` and `ThemeToggle` for persistence in `localStorage`.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- Google OAuth credentials (for Supabase Auth)

## Local setup

### 1. Clone and install

```bash
git clone <repository-url>
cd cyan-otter
npm install
```

### 2. Configure Supabase

1. Create a project in the Supabase dashboard.
2. Open **SQL Editor** and run the contents of `supabase-schema.sql` to create the `bookmarks` table, RLS policies, and Realtime publication.
3. Under **Authentication → Providers**, enable **Google** and add your OAuth client ID and secret from [Google Cloud Console](https://console.cloud.google.com/).
4. Under **Authentication → URL Configuration**, add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - (add your production URL later when you deploy)

### 3. Environment variables

Copy the example file and fill in your Supabase values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find the URL and anon key under **Project Settings → API** in Supabase.

For local development, do **not** set `NEXT_PUBLIC_SITE_URL`. The app uses `http://localhost:3000` automatically so OAuth stays on localhost.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and add bookmarks on the dashboard.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | Run ESLint |

## Production (Vercel)

1. Deploy the repo to Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project environment.
3. Set `NEXT_PUBLIC_SITE_URL` to your production origin (no trailing slash), e.g. `https://your-app.vercel.app`.
4. Add the same production callback URL in Supabase **Authentication → URL Configuration**: `https://your-app.vercel.app/auth/callback`.


