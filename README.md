# Film Show

A polished landing website for **Film Show**, an NYC short film event with live screenings, performances, a jury selected 1st Place, audience voted 2nd and 3rd, and $6,000 cash.

Built with Next.js App Router and Tailwind CSS. Ready to deploy to Vercel.

## Pages

- `/` - Home
- `/about` - About the event
- `/tickets` - Branded ticket information page with purchase handled by Luma
- `/sponsors` - Sponsor information and inquiry form

## Poster

The site is intentionally typography-first. The rendered imagery is limited to the official logo, the header mascot, and the featured poster.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

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

The email and sponsor forms currently use client-side success states only. Connect them to a form service, CRM, or API route when you are ready to collect real submissions.
