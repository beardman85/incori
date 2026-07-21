# Launch Checklist — incori.org

Everything the site needs is in this repo. Follow these steps to go live on
**Cloudflare Pages**. Rough order: deploy → forms → domain → verify.

---

## 1. Deploy to Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the **`beardman85/incori`** repo, branch **`main`**.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(leave blank — repo root is the project)*
4. **Save and Deploy.** You'll get a `https://incori.<something>.pages.dev` URL in ~1–2 min.
5. Every push to `main` now auto-deploys. PRs get preview URLs.

> `functions/api/contact.ts` and `public/_redirects` are picked up automatically by Pages.

---

## 2. Wire up the contact form (Resend)

The form endpoint (`/api/contact`) is built and live, but needs an email sender.

1. Create a **[Resend](https://resend.com)** account.
2. **Verify the domain** `incori.org` in Resend (add the DNS records it gives you).
   Once verified you can send *from* an address at that domain.
3. In Resend, create/copy an **API key**.
4. Cloudflare Pages → your project → **Settings → Environment variables** → add
   (Production, and Preview if you want):
   - `RESEND_API_KEY` = *your Resend key*
   - `CONTACT_TO` = `hello@incori.org`
   - `CONTACT_FROM` = `Inclusion Oriented <no-reply@incori.org>` (a Resend-verified sender; the no-reply mailbox need not exist)
5. **Redeploy** (Deployments → Retry deployment) so the vars take effect.
6. Submit each form (Request Services, Apply, Volunteer) and confirm the email
   arrives at `hello@incori.org`.

> Until these vars are set, forms accept input and show success but **do not email**.

---

## 3. Custom domain + DNS cutover

1. Cloudflare Pages → your project → **Custom domains** → add `incori.org` and `www.incori.org`.
2. If the domain's DNS is already on Cloudflare, it wires up automatically.
   Otherwise point the domain's nameservers to Cloudflare first.
3. Wait for SSL to provision (usually minutes). Test both apex and `www`.

> **Before cutover:** review the site on the `*.pages.dev` URL. Cutover replaces
> the old WordPress site, so do it once forms + content are confirmed.

---

## 4. Redirects (already configured)

`public/_redirects` maps the old WordPress URLs that changed:
- `/join-our-team/` → `/work-with-us/`
- `/hello-world/`, `/feed/` → `/`

All other old slugs (about, services, request-services, apply, work-with-us,
volunteer, resources) are unchanged. Add more lines to that file if analytics
later shows old URLs 404ing.

---

## 5. Post-launch verification

- [ ] All nav links + footer links work; no 404s
- [ ] Submit all 3 forms → emails arrive at hello@incori.org
- [ ] Service cards: "Learn more" → detail page, "Request" → pre-filled form
- [ ] Resource PDFs download; partner + waiver links open
- [ ] Re-run **PageSpeed Insights** on the live URL (mobile + desktop) and add an
      "after" table to `docs/performance-baseline.md` (target: mobile Perf ≥95, LCP <2.5s)
- [ ] Submit `https://www.incori.org/sitemap-index.xml` in Google Search Console

---

## Still to personalize (optional)

- Update the ghost/hero copy or images anytime — content lives in `src/content/`
  and `src/lib/site.ts`.
- Social links are set (Facebook + Instagram) in `src/lib/site.ts`.
