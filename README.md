# Black Atlas Denver

Black Atlas Denver is a public directory for Black-owned businesses, events, restaurants, services, and culture in the Denver area.

## Production Readiness

This app is configured for a public MVP launch with:

- Supabase Auth-backed admin access using `profiles.is_admin`
- Moderated business and event submissions
- Server-side validation, honeypot protection, optional Turnstile verification, and rate limiting
- Source labels for community submissions and imported records
- Manual verification for trusted business badges
- Vercel cron routes for Eventbrite and Ticketmaster syncs

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` and fill in Supabase credentials. Turnstile is optional; when both Turnstile env vars are omitted, submissions rely on honeypot protection, rate limiting, and manual moderation.

## Database Setup

Apply migrations in order:

```bash
supabase db push
```

To bootstrap an admin:

1. Create a Supabase Auth user.
2. Update that user's profile row:

```sql
update profiles set is_admin = true where id = '<auth-user-id>';
```

Admin pages are available at `/admin/login`.

## Required Environment Variables

- `NEXT_PUBLIC_SITE_URL`: production site URL for canonical metadata.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable client key. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported for older projects.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key for admin and sync jobs.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: optional Cloudflare Turnstile site key.
- `TURNSTILE_SECRET_KEY`: optional Cloudflare Turnstile secret key.
- `RATE_LIMIT_SALT`: long random string used when hashing request identifiers.
- `ADMIN_SECRET`: bearer token for manual sync route calls.
- `CRON_SECRET`: bearer token for Vercel cron sync calls.
- `EVENTBRITE_PRIVATE_TOKEN`: Eventbrite API token.
- `TICKETMASTER_API_KEY`: Ticketmaster Discovery API key.
- `GOOGLE_PLACES_API_KEY`: Google Places API key.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

## Operations

- Public business submissions remain pending until an admin approves them.
- Public event submissions remain pending until an admin approves them.
- Google Places imports remain pending and unverified.
- Eventbrite and Ticketmaster syncs publish upcoming imported events, labeled by source.
- Only manually confirmed businesses should be marked verified.
