# Inclusion Oriented — incori.org

Marketing website for **Inclusion Oriented Inc.**, a certified developmental-disabilities
service provider in Omaha, NE. Rebuilt from WordPress/Elementor as a fast, static
**Astro** site deployed to **Cloudflare Pages**.

Built by **Beardman Design LLC**.

## Tech stack

- **[Astro 5](https://astro.build)** — static site generator (zero JS by default)
- **Tailwind CSS 4** — via `@tailwindcss/vite`; brand tokens in `src/styles/global.css`
- **Content Collections** — services / values / team as Markdown (`src/content/`)
- **Self-hosted fonts** — Space Grotesk (display) + Inter (body) via Fontsource
- **Cloudflare Pages** — hosting; Pages Functions for forms (see below)

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server (http://localhost:4321)
npm run build      # production build → ./dist
npm run preview    # preview the production build locally
```

## Project structure

```
src/
  styles/global.css      # Tailwind + brand design tokens + a11y base
  lib/site.ts            # nav, contact, social, org constants (edit here)
  content.config.ts      # content collection schemas
  content/               # services / values / team (Markdown — edit here)
  layouts/BaseLayout.astro
  components/             # shared + home/ section components
  pages/                 # routes (index.astro = homepage)
public/                  # images, logos, favicon, robots.txt
functions/               # Cloudflare Pages Functions (forms — added next)
```

## Editing content

- **Text / images for a service:** edit the matching file in `src/content/services/`.
- **Contact info, nav, social links:** edit `src/lib/site.ts`.
- **Homepage sections:** `src/components/home/`.

## Deployment (Cloudflare Pages)

1. Push this repo to GitHub/GitLab.
2. In Cloudflare Pages → **Create project** → connect the repo.
3. Framework preset: **Astro**. Build command `npm run build`, output dir `dist`.
4. Add the custom domain `incori.org` / `www.incori.org`.

## Status

- ✅ Foundation + homepage (this pass)
- ⬜ Interior pages: About, Services, Work With Us, Resources, Request Services, Apply, Volunteer
- ⬜ Forms → email via Cloudflare Pages Function + Resend (`functions/api/contact.ts`)
- ⬜ 301 redirects from old WordPress URLs

## Notes / TODO

- Social profile URLs in `src/lib/site.ts` are placeholders — replace with real links.
- Interior nav pages currently use a temporary "coming soon" stub (`PageStub.astro`).
