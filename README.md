# locale — curatedlocale.uk

A curated local business directory for Bristol, built to showcase independent
businesses without ads, pay-to-rank placements, or algorithmic feeds. Every
listing is reviewed by an editor before it's tiered and published; the site
itself is server-rendered on the edge and backed by a Postgres database with
a purpose-built internal tool for the editorial team.

**Live:** https://www.curatedlocale.uk

## What it is

The public site is a directory of ~3,500 independent businesses across
Bristol, organised by city → area → category, with individual listing pages,
curated "best of" landing pages, and full-text search. Listings carry
delivery and booking platform links, social links, opening hours, Google
ratings, and editorial content (founder stories, descriptions, curator
notes), and are grouped into four visible tiers — Editor's Choice,
Recommended, Top Rated, and Standard — reflecting manual curation rather
than a paid placement model.

Behind the public pages is a password-protected curator portal (see
[Curator interface](#curator-interface)) that the editorial team uses to
review, tag, and publish listings and landing pages directly against the
production database, with row-level locking and a full audit trail.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Astro 6](https://astro.build), SSR (`output: 'server'`) |
| Hosting / adapter | Cloudflare Pages via `@astrojs/cloudflare` |
| Database | Supabase (Postgres), queried directly from SSR routes via `@supabase/supabase-js` |
| Content | Astro Content Layer API with a custom Supabase loader for landing pages (`src/content.config.ts`) |
| Maps | Leaflet, loaded from CDN only on listing pages that need it |
| Curator tooling | Static HTML + vanilla JS, authenticated against Supabase Auth |

No client-side framework (React/Vue/etc.) — interactivity on the public site
is plain JS islands where needed (search, filters, map); everything else is
rendered server-side per request.

## Project structure

```
src/
├── pages/
│   ├── index.astro              # Homepage — tier highlights, city/category counts
│   ├── search.astro             # Client-side search over the full listing set
│   ├── sitemap.xml.ts           # Hand-rolled sitemap (see SEO section)
│   ├── listing/[slug].astro     # Legacy listing URL — 301s to the canonical city/area/slug route
│   └── [city]/
│       ├── index.astro          # City hub — area & category browse links
│       └── [...slug].astro      # Catch-all: resolves area, category, area+category,
│                                 # listing, and landing-page routes from the URL shape at request time
├── components/
│   ├── landing/                 # "Best of" editorial landing page rendering
│   └── ...                      # ListingCard, TieredListings, filters, booking/delivery/social links
├── content/landing/              # Early hand-written landing page copy, superseded by
│                                 # the auto-generated SEO copy in utils/landingCopy.js
├── lib/                          # Supabase clients (server + browser)
└── utils/                        # Tiering, slugs, tag/category taxonomy, SEO helpers

public/
└── curator/                      # The curator portal (see below) — static HTML, not part of the Astro build

scripts/                          # One-off data migration, import, and Supabase maintenance scripts
                                   # (run from the repo root — several resolve relative paths against it)

docs/                              # Internal planning notes and feature write-ups (GDPR, delivery
                                    # links, listing templates, RLS fixes) — not needed to run the site
```

The `[city]/[...slug].astro` catch-all is the core routing decision: rather
than a fixed `/city/area/category/listing` depth, the route inspects how
many path segments it received and queries Supabase to work out whether
it's looking at an area, a category, an area+category combination, a
listing, or a published landing page — letting every one of those live at
a clean, short URL instead of a fixed template depth.

## SEO

The directory's growth depends entirely on organic search, so most of the
non-visual engineering effort went here rather than into UI polish:

- **Canonical host consistency.** `astro.config.mjs` declares a single
  `site` origin, and every canonical tag, structured data block, and the
  sitemap derive their host from it rather than hardcoding it — a sitemap
  pointing at a different host than the canonical tag is one of the more
  common ways a new directory site silently fails to get indexed, since
  Google logs every sitemap URL as a redirect instead of indexing it.
- **Hand-rolled sitemap, not the stock integration.** `src/pages/sitemap.xml.ts`
  paginates past Supabase/PostgREST's 1,000-row cap to include every active
  listing, area, and category page, applies the same visibility rules the
  site itself uses (closed/unverified listings and listings without an
  address are excluded — they're not reachable from any page, so they
  shouldn't be submitted for indexing either), and sets `lastmod` from the
  database's own `updated_at` for landing pages.
- **Real 404s, not soft 404s.** Unmatched routes use Astro's `rewrite()`
  (same URL, correct status) rather than a redirect to a `/404` page that
  would itself respond `200` — the latter is reported by Google as a "soft
  404" and quietly suppresses indexing of the broken URL instead of
  correctly dropping it.
- **No orphaned or duplicate-signal pages.** Internal link hubs (the city
  page's area/category browse links, the sitewide footer) are generated
  from the same active-listing query used everywhere else, so every area
  and category with listings is reachable from at least one link on the
  site — a hub page built from a stale or mismatched filter will silently
  stop linking to a whole segment of the site without ever producing an
  error.
- **Crawl budget.** Non-canonical URL variants (`?subCategory=` filters) are
  marked `noindex` and their links `nofollow`, so crawl budget goes to
  indexable pages rather than filter permutations of the same listing set.
- **Structured data.** Listing pages emit `LocalBusiness` JSON-LD (mapped to
  a more specific schema type per category — `Restaurant`, `CafeOrCoffeeShop`,
  `SportsActivityLocation`, etc. — where one applies) plus `BreadcrumbList`,
  built from the same canonical origin as the rest of the page.
- **Edge caching tuned per route type** (`public/_headers`): a year on
  content-hashed static assets, an hour (with a day of stale-while-revalidate)
  on listing and browse pages, and five minutes on the homepage so editorial
  changes there surface quickly without losing edge caching entirely.

## Curator interface

A password-protected internal tool at `/curator/`, built as static HTML with
vanilla JS talking directly to Supabase (no backend API layer) and gated by
Supabase Auth with a `curator` role claim.

**Listing review** (`site.html`) — loads every listing (paginated past the
1,000-row API cap) into a filterable, searchable card grid and gives editors
a full edit panel per listing: category/sub-category, ranking tier, tags,
descriptions, founder stories, opening hours, contact and social details,
and every delivery/booking platform URL the site supports. Two things make
it safe for more than one editor to use at once:

- **Row-level editing locks.** Opening a listing for edit acquires a lock
  row in Supabase (`listing_locks`), visible to every other open session,
  that expires automatically after 10 minutes and is refreshed by a
  heartbeat while the editor is actively working — so two curators can't
  silently overwrite each other's changes, and an abandoned tab doesn't
  lock a listing forever.
- **Audit trail.** Every save is diffed field-by-field against the
  pre-edit row; a Postgres trigger writes the resulting change set to a
  `curation_audit` table, which the UI surfaces as a per-listing history
  (who changed what, and when) without the client needing to compute or
  send the diff itself.

The same screen also surfaces the public-facing submission funnel: business
owners can submit edits or claim an existing listing from the public site,
and those land in a review queue (`owner_submissions`, `owner_profiles`)
that a curator approves or rejects from here, merging accepted changes
straight into the listing.

**Landing page builder** (`landing-pages.html`) — the tool behind the
site's editorial "best of" pages. Curators assemble a page from a hero
image, intro copy, and an ordered list of sections, each able to pull in
and reorder specific listings via live search against the same `listings`
table. One detail worth calling out: the hero image recolour tool runs a
small SPSA (simultaneous perturbation stochastic approximation) optimiser
in-browser to solve for the CSS `filter` values that tint a source photo
to a chosen brand colour, rather than requiring a pre-edited image per
page. Publishing a page writes straight to Supabase and, optionally, fires
a Cloudflare deploy hook to trigger a rebuild immediately rather than
waiting for the next scheduled build.

## Development

```sh
npm install
npm run dev       # localhost:4321
npm run build      # production build to ./dist/
npm run preview    # preview the production build locally
```

Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` (see `.env.example`) — pages
that read listing or landing-page data return empty results without them
rather than failing the build.
