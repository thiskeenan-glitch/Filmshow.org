# Filmshow Live setup

Filmshow Live ships disabled. The ordinary Filmshow site does not depend on it.

## 1. Database

Apply the Supabase migrations in order, including:

- `20260916195323_create_audience_system.sql`
- `20260916195522_add_audience_upsert_rpc.sql`
- `20260916203203_create_filmshow_live.sql`

The Live migration creates the reusable event, program, state, entitlement, and online-vote tables. It seeds Filmshow Vol. 1 in a disabled preshow state. Every exposed Live table has RLS and explicit grants. Online voting is protected by both RLS and a unique `(event_id, user_id)` constraint.

Run the database suite with:

```bash
supabase test db
supabase db lint --linked --level warning
supabase db advisors
```

## 2. Supabase Auth

Set the public URL and publishable key variables from `.env.example`. The service/secret key remains server-only.

In Supabase Auth:

1. Enable email Magic Links.
2. Set the production Site URL to `https://www.filmshow.org`.
3. Allow `https://www.filmshow.org/auth/callback` and the equivalent preview/local callback URLs.
4. Configure production SMTP before launch. Supabase's default mailer is intentionally rate-limited.

Accounts are connected to the existing `audience_contacts` record without granting marketing consent. Authentication alone never subscribes a viewer to Brevo.

## 3. Stripe test checkout

Create a one-time Stripe test price for **$8 USD** and set `STRIPE_LIVE_PRICE_ID`.

Create a test webhook endpoint at:

`https://www.filmshow.org/api/stripe/live/webhook`

Subscribe it to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Set that endpoint's signing secret as `STRIPE_LIVE_WEBHOOK_SECRET`. The webhook verifies the signature, event metadata, payment status, amount, and currency before granting access. The browser redirect never grants access.

## 4. Stream

The viewer loads HLS through a protected entitlement endpoint and uses HLS.js
for cross-browser playback. For an already signed or tokenized HLS feed, set:

```env
FILMSHOW_LIVE_STREAM_PROVIDER=hls
FILMSHOW_LIVE_HLS_URL=https://example.com/final-feed.m3u8
```

For Mux, create a **signed** playback ID and set:

```env
FILMSHOW_LIVE_STREAM_PROVIDER=mux
MUX_PLAYBACK_ID=your-signed-playback-id
MUX_SIGNING_KEY_ID=your-signing-key-id
MUX_SIGNING_PRIVATE_KEY=your-base64-private-key
```

The server issues a six-hour RS256 playback token only after rechecking the
viewer session and entitlement. Leave the provider as `none` to show the
branded not-live-yet screen. Do not use a public Mux playback ID for the paid
broadcast.

## 5. Safe enablement

Three independent switches prevent an accidental sale:

1. `FILMSHOW_LIVE_ENABLED=true`
2. `live_events.is_enabled = true`
3. `live_events.ticket_sales_enabled = true`

Keep all three off until the test checkout, webhook, magic-link email, and stream have been verified in the deployed environment.

The private show controls are at `/admin/live` and reuse the existing Supabase-backed Filmshow admin login and `FILMSHOW_ADMIN_EMAILS` allowlist. Admin authorization does not use editable user metadata.
