# Performance Baseline — old WordPress site (before the rebuild)

Captured for posterity so we can measure the new Astro/Cloudflare build against the
site it replaces.

- **URL:** https://www.incori.org/
- **Site:** the original **WordPress + Elementor** site (pre-migration)
- **Tool:** Google PageSpeed Insights — Lighthouse 13.4.0
- **Captured:** Jul 21, 2026, 9:57 AM CDT
- **Field data:** No Data (not enough real-user traffic in CrUX)

## Lab scores

| Category | Mobile | Desktop |
|---|---|---|
| Performance | **59** 🟠 | **85** 🟠 |
| Accessibility | 93 🟢 | 94 🟢 |
| Best Practices | 100 🟢 | 100 🟢 |
| SEO | 92 🟢 | 92 🟢 |
| Agentic Browsing | 1/2 | 1/2 |

## Core metrics

| Metric | Mobile | Desktop |
|---|---|---|
| First Contentful Paint | 4.8 s 🔴 | 0.5 s 🟢 |
| Largest Contentful Paint | **16.2 s** 🔴 | 2.5 s 🔴 |
| Total Blocking Time | 20 ms 🟢 | 0 ms 🟢 |
| Cumulative Layout Shift | 0 🟢 | 0.004 🟢 |
| Speed Index | 7.8 s 🔴 | 1.4 s 🟠 |

- Mobile emulation: Moto G Power, Slow 4G throttling
- Desktop emulation: custom throttling

## Takeaways / targets for the new build

The old site's biggest problem is **load speed on mobile** — a 16.2 s LCP and 4.8 s FCP
(typical of a plugin-heavy WordPress/Elementor stack). Accessibility, SEO, and CLS are
already solid, so the rebuild should **hold or improve those** while dramatically cutting
load time.

**Goals for the Astro/Cloudflare site (mobile, Slow 4G):**
- Performance ≥ 95
- LCP < 2.5 s (from 16.2 s)
- FCP < 1.8 s (from 4.8 s)
- Speed Index < 3.4 s (from 7.8 s)
- Maintain Accessibility ≥ 95, Best Practices 100, SEO ≥ 95, CLS < 0.1

_Re-run PageSpeed Insights on the deployed Cloudflare Pages URL and add an "after" table
below once the new site is live._
