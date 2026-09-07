# Filmshow

A polished website for **Filmshow**, a New York City live cultural event combining short films from local filmmakers, live experimental theater, and an audience gathered in the room.

Built with Next.js App Router and Tailwind CSS. Ready to deploy to Vercel.

## Pages

- `/` - Home
- `/about` - About the event
- `/how-it-works` - How Filmshow works
- `/tickets` - Direct-link two-ticket giveaway page for poster QR codes
- `/originals` - Filmshow Grant pitch application
- `/sponsors` - Sponsor information and inquiry form

## Images

The site uses the official Filmshow logo, the red cowboy mascot, the featured trailer, and curated event photos in the homepage gallery.

## Run locally

```bash
pnpm install
pnpm dev
```

Open the local address printed by Next.js.

## Build

```bash
pnpm build
pnpm start
```

## Deploy to Vercel

```bash
pnpm build
```

Then push this project to GitHub, import the repository in Vercel, keep the default Next.js settings, and deploy.

Ticket checkout is handled by Luma. The private ticket-giveaway page saves entries in Supabase and syncs them to the Filmshow Ticket Giveaway Entries Google Sheet. Completed short-film submissions are handled by FilmFreeway. Filmshow Grant uses Stripe, Supabase, and Brevo when the required production environment variables are configured.
