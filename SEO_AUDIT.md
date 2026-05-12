# SEO & AIO Audit — Mantle Clothing

**Date:** 2026-05-12
**Scope:** Read-only audit. Zero code changes. This document is the punch list for all subsequent phases.
**Goal:** Maximize both classical SEO (Google/Bing rich results, organic rankings) and AIO (AI Optimization — citation rates in ChatGPT, Claude, Perplexity, Gemini, AI Overviews).

---

## 0. How to read this document

Every finding has:
- **ID** — stable reference (e.g. `P0-1`) for follow-up conversations
- **Priority** — `P0` (do first, high impact, low risk) → `P3` (last, high risk or low impact)
- **Effort** — `S` (<1 hr), `M` (1–4 hr), `L` (4+ hr)
- **Risk** — `low` (purely additive, can't break existing rendering), `medium` (touches existing markup/metadata), `high` (touches rendering pipeline, RSC boundaries, or data flow)
- **Phase** — which delivery phase it belongs to (Phase 1–4, see §8)

Greenlight items individually or by phase. Nothing in this document changes any code.

---

## 1. Executive Summary

### The state of SEO on this site, in one paragraph

You have a solid metadata baseline — root layout has full OG/Twitter/canonical/robots, most content pages have per-page `metadata` exports, the product/category/collection slug pages use `generateMetadata` pulling from Yoast, and a dynamic `sitemap.js` lists products, categories, collections, and routes. Image handling is consistent (`next/image` everywhere, alt text on every image I checked). That's the good news.

The bad news has three parts:

1. **There is no structured data anywhere on the site.** A `grep` for `application/ld+json` returned zero matches. No `Product`, `Organization`, `BreadcrumbList`, `FAQPage`, `Review`, or `AggregateRating` schema. This is the single biggest miss for *both* SEO (rich results in Google) and AIO (LLMs preferentially cite pages with structured data because it disambiguates entities). Your WooCommerce data already includes everything needed (`sku`, `price`, `stock_status`, `on_sale`, `average_rating`, `rating_count`, `images`, `brand`-able attributes) — you're sitting on a goldmine you're not surfacing.
2. **Critical product / shop / category / collection pages are `"use client"` components with commented-out `<h1>` tags.** That means on initial HTML render (what Google's first-pass crawler and most LLM scrapers see), the H1 is missing, the product/category name is missing, and the page is essentially a skeleton. Search engines do execute JS for indexing, but (a) it's slower, (b) it's lower priority, (c) most LLM crawlers do *not* execute JS. This is silently bleeding visibility.
3. **There is no `robots.txt`, no `llms.txt`, no web app manifest, and no homepage-specific metadata override** (the homepage falls back to root metadata, which is fine but not ideal). The `sitemap.js` exists but isn't referenced by a robots file.

### What's *missing* in terms of brand-new content/files

| Asset | Status | Impact |
|---|---|---|
| `src/app/robots.js` | Missing | High — no explicit sitemap declaration, no AI-bot directives |
| `llms.txt` (root) | Missing | High for AIO — emerging standard |
| `llms-full.txt` (root) | Missing | High for AIO — full content for LLM context |
| JSON-LD `Organization` (root layout) | Missing | High — establishes brand entity |
| JSON-LD `Product` (per product page) | Missing | Critical — rich results, AIO product citations |
| JSON-LD `BreadcrumbList` (every page with breadcrumbs) | Missing | Medium-high — sitelinks, navigation hints |
| JSON-LD `WebSite` w/ `SearchAction` (root) | Missing | Medium — sitelinks search box |
| JSON-LD `FAQPage` (about/warranty/contact) | Missing | Medium-high for AIO |
| JSON-LD `ItemList` (shop/category/collection grids) | Missing | Medium — list rich results |
| `src/app/manifest.js` | Missing | Low — PWA polish |
| Dynamic OG image generator (`opengraph-image.js`) | Missing | Medium — every page uses the same `/images/banner-1.jpg` |
| Homepage-specific metadata override | Missing (uses root) | Low-medium |

### The single biggest leverage point

**P0-1 + P0-2 below.** Add JSON-LD `Product` schema to product pages and `Organization` schema to the root layout. These two additions, both pure additions with zero rendering risk, will likely move the needle more than every other item combined — especially for AIO, where LLMs heavily favor structured data when deciding what to cite.

---

## 2. What's already good (don't break it)

Documenting the baseline so we don't regress.

- **Root metadata** (`src/app/layout.js:21-73`): full `metadata` object with title, description, keywords (harmless), `metadataBase`, canonical, robots, OG (incl. 1200×630 image), Twitter card. Solid foundation.
- **Per-page `metadata` exports** on About, Contact, In-The-Wild, Partners, Blog (listing), Shop (via layout). Good.
- **`generateMetadata`** on product slug pages (`src/app/product/[slug]/page.js:9-78`) pulling from Yoast — well-architected.
- **`generateMetadata`** in `src/app/categories/[slug]/layout.js` and `src/app/collections/[slug]/layout.js` — the right pattern (metadata in layout, page can stay `"use client"`).
- **Dynamic sitemap** (`src/app/sitemap.js`): includes products, categories, collections, and static routes. Correctly excludes `/order-confirmation`. Hits all in-stock published products.
- **`next/image`** used consistently — 37+ occurrences across the codebase, every one with `alt` text on the cases I sampled. No raw `<img>` tags found.
- **`priority`** flag set on hero images (homepage `HeroSlideshow.jsx:72`, About hero, Contact hero, etc.) — good for LCP.
- **Middleware** correctly excludes API and Next.js asset routes from geo-blocking. (One concern below: doesn't explicitly exclude `sitemap.xml` / `robots.txt` — see P1-9.)
- **Yoast integration** on product pages pulls full `yoast_head_json` with OG, canonical, etc. Strong base for product SEO.

---

## 3. Findings — Priority 0 (do first; high impact, low risk, purely additive)

These are all "create new file" or "add new component to existing render tree" — none of them modify existing markup, so they cannot break what's already rendering.

### P0-1 — Add `Product` JSON-LD to product detail pages

- **What:** New server component that emits `<script type="application/ld+json">` with full `Product` schema (`@type: Product`, `name`, `image`, `description`, `sku`, `brand: Mantle Clothing`, `offers: { @type: Offer, price, priceCurrency: USD, availability, url }`, `aggregateRating` if `rating_count > 0`).
- **Why:** Unlocks Google product rich results (price, stars, stock badge directly in SERP). Massive AIO impact: ChatGPT/Perplexity/Claude search explicitly favor structured product data when answering "best tactical pants for cops" style queries.
- **Where:** New component `src/app/components/seo/ProductJsonLd.jsx` (server). Inject into `src/app/product/[slug]/page.js` inside `<SingleProductComponent>` wrapper.
- **Data source:** All fields already exist in the WooCommerce product object (`product.sku`, `product.price`, `product.stock_status`, `product.on_sale`, `product.average_rating`, `product.rating_count`, `product.images`, `product.short_description`).
- **Effort:** S–M | **Risk:** low | **Phase:** 1

### P0-2 — Add `Organization` + `WebSite` JSON-LD to root layout

- **What:** Two JSON-LD blocks in `src/app/layout.js`. `Organization` declares the brand entity (name, URL, logo, sameAs[social profiles], contactPoint). `WebSite` declares the site with optional `SearchAction` (enables sitelinks search box in Google).
- **Why:** Establishes the canonical brand entity in Google's Knowledge Graph and in LLM training/citation. AIO impact: when an LLM is asked "who makes Mantle tactical clothing?" the answer is dramatically more confident if there's an `Organization` schema with `sameAs` pointing to verified social profiles.
- **Where:** `src/app/layout.js` — append JSON-LD inside `<head>` (or via component in `<body>`).
- **Open question (Q-1):** Need confirmed social profile URLs (Instagram is the only one I see linked anywhere — `instagram.com/mantle_clothing/`). Add Facebook, YouTube, X, LinkedIn if they exist.
- **Effort:** S | **Risk:** low | **Phase:** 1

### P0-3 — Add `BreadcrumbList` JSON-LD wherever breadcrumbs render

- **What:** New `<BreadcrumbsJsonLd>` component emitting `BreadcrumbList` schema, paired with existing visual breadcrumbs.
- **Why:** Google replaces URL with breadcrumb in SERP listings (cleaner display, more clicks). LLMs use breadcrumbs to understand site hierarchy when summarizing.
- **Where:** Breadcrumb-displaying pages: `shop`, `categories/[slug]`, `collections/[slug]`, `product/[slug]`, `categories` (listing), `collections` (listing), `blog/[slug]`.
- **Note:** `blog/[slug]` already has semantic `<nav aria-label="Breadcrumb">` with proper `<ol>/<li>` — best foundation. The shop/category breadcrumbs are flat `<div>`s and should be upgraded to `<nav>/<ol>/<li>` *while we're there* (small a11y win, same render tree).
- **Effort:** M | **Risk:** low | **Phase:** 1

### P0-4 — Create `src/app/robots.js`

- **What:** Next.js convention file exporting a `robots` config. Allow all crawlers, declare sitemap URL, optionally allow/disallow specific AI bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc. — see Q-2 below).
- **Why:** Without it, Next.js serves no robots.txt, leaving sitemap discovery to chance. Also where you'd declare AI-bot policy.
- **Where:** New file `src/app/robots.js`.
- **Risk note:** **Middleware concern.** `src/middleware.js` matcher is `'/((?!api|_next/static|_next/image|favicon.ico).*)'` — this means `/robots.txt` and `/sitemap.xml` requests pass *through* the geo-block middleware. Googlebot crawls from US (allowed), but defensive practice: add `robots.txt|sitemap.xml` to the matcher exclusion list. (See P1-9.)
- **Open question (Q-2):** Allow or block GPTBot, ClaudeBot, PerplexityBot, etc.? Most e-commerce sites *allow* AI crawlers because they want product citations.
- **Effort:** S | **Risk:** low | **Phase:** 1

### P0-5 — Create `llms.txt` and `llms-full.txt`

- **What:** Static files in `public/` (since they need to be at site root). `llms.txt` is a short Markdown index of key pages with descriptions. `llms-full.txt` includes the full prose content of those pages, optimized for LLM context windows.
- **Why:** Emerging standard (proposed by Jeremy Howard, adopted by Anthropic, Mintlify, Cloudflare, etc.). AI search tools and agents check for these files when answering questions about a domain. Pure AIO win.
- **Where:** New files `public/llms.txt` and `public/llms-full.txt`.
- **Effort:** S (llms.txt) + M (llms-full.txt with curated content) | **Risk:** low | **Phase:** 1

### P0-6 — Fix the commented-out `<h1>` on key category/collection/shop pages

- **What:** Uncomment / restore the `<h1>` that displays the category name on:
  - `src/app/shop/page.js:44-52` (currently `{/* <h1 ...> Shop All Products </h1> */}`)
  - `src/app/categories/[slug]/page.js:110-118` (currently `{/* <h1 ...> {category.name} </h1> */}`)
  - `src/app/collections/[slug]/page.js:116-124` (currently `{/* <h1 ...> {collection.name} </h1> */}`)
- **Why:** H1 is the single most-weighted on-page heading signal. Missing it means search engines and LLMs have to infer page topic from URL and `<title>` alone. (Title tag is fine — the *visible* page H1 is missing.)
- **Risk:** The H1s were almost certainly commented out for visual/design reasons. Reinstating them changes layout. Mitigation: render the H1 with `sr-only` CSS class so it's available to crawlers without visually changing the page. *Or* style it to match the design.
- **Open question (Q-3):** Visual H1 (better SEO weight) or `sr-only` H1 (zero visual change)?
- **Effort:** S | **Risk:** low (if `sr-only`) / medium (if visible — design change) | **Phase:** 1

### P0-7 — Fix "sustainable" / "eco-friendly" branding mismatch

- **What:** Search-and-replace "sustainable apparel", "eco-friendly", "sustainable products" language that doesn't match the brand. Targets:
  - `src/app/layout.js:51` — OG image alt: `'Mantle Clothing - Sustainable Apparel'`
  - `src/app/shop/layout.js:17` — same
  - `src/app/about/page.js:22` — same
  - `src/app/contact/page.js:21` — same
  - `src/app/partners/page.js:21` — same
  - `src/app/in-the-wild/page.js:23` — same
  - `src/app/blog/page.js:24` — same
  - `src/app/components/ProductCategories.jsx:32,38,44` — descriptions use "Waterproof, sustainable outerwear", "Versatile, eco-friendly apparel", "Sustainable accessories"
  - `src/app/components/shop/ProductGrid.jsx:36` — fallback short description: `'Sustainable eco-friendly apparel'`
  - `src/app/categories/[slug]/layout.js:20` — fallback `'Explore sustainable products.'`
  - `src/app/collections/[slug]/layout.js:23` — fallback contains the same
- **Why:** Brand-keyword conflict. Google and LLMs both use entity recognition to understand what a brand sells. Saying "sustainable apparel" in the OG alt and "tactical clothing" in the title gives mixed signals — at best dilutes ranking for tactical/LE keywords, at worst causes the site to occasionally rank for sustainability queries it can't fulfill.
- **Effort:** S | **Risk:** low | **Phase:** 1

### P0-8 — Homepage-specific metadata override

- **What:** The homepage (`src/app/page.js:10-62`) defines its own `metadata`, but it's literally identical to the root layout's metadata. That works (just redundant). However, the homepage *should* have a slightly different OG description optimized for "the brand homepage" rather than the default. Also, the homepage `metadata.openGraph.images` duplicates root.
- **Why:** Minor — but homepage is the most-shared, most-rich-link-previewed page. Worth one custom OG image + tailored copy.
- **Effort:** S | **Risk:** low | **Phase:** 1
- **Note:** This is genuinely small. Could defer to Phase 2.

---

## 4. Findings — Priority 1 (important; medium impact; mostly additive)

### P1-1 — Add `FAQPage` JSON-LD to Warranty, About, Contact, Partners

- **What:** Inline an `<FaqJsonLd>` block on pages that contain Q&A-style content. Warranty page is the obvious one — it literally walks through "How to Process a Warranty Claim". About has implicit Q&A (Our Story, Mission, Design Philosophy).
- **Why:** Enormous AIO leverage. LLMs disproportionately cite FAQ-marked content because the question-answer pairing is unambiguous training/citation data.
- **Where:** `src/app/warranty/page.js`, `src/app/about/page.js`, `src/app/contact/page.js`, `src/app/partners/page.js`.
- **Effort:** M | **Risk:** low | **Phase:** 1 or 2

### P1-2 — Add `ItemList` JSON-LD to shop / category / collection grids

- **What:** Emit `ItemList` schema listing the product URLs displayed on the page.
- **Why:** Helps Google and LLMs understand these are list/index pages and the items they enumerate. Improves shopping graph entry rates.
- **Where:** `src/app/shop/page.js`, `src/app/categories/[slug]/page.js`, `src/app/collections/[slug]/page.js`.
- **Caveat:** Schema must be server-rendered. Since these pages are `"use client"`, the JSON-LD has to be emitted from a server component wrapper or the page must be partially converted. Easiest: emit a placeholder `ItemList` in the layout and rely on Yoast schema on the WP side as fallback.
- **Effort:** M | **Risk:** low–medium | **Phase:** 2

### P1-3 — Title template + consistent format

- **What:** Set `title.template: '%s | Mantle Clothing'` in root metadata. Update child pages to use `title` as a bare string (e.g. `'About Us'`), letting the template append `' | Mantle Clothing'`. Resolves inconsistencies: some titles use `' - '`, some `' | '`, some have no suffix.
- **Why:** Consistent branding in SERP, easier maintenance, prevents duplicate brand mentions ("Mantle Clothing | Mantle Clothing").
- **Where:** `src/app/layout.js` + every page metadata file.
- **Effort:** M | **Risk:** medium (touches every page's title — verify each in build) | **Phase:** 2

### P1-4 — Categories listing page is missing metadata

- **What:** `src/app/categories/page.js` is `'use client'` and has no `metadata` export. Falls back to root metadata, so SERP shows the root title.
- **Why:** This page targets "shop categories" / "mantle pants collection" / "mantle outerwear" type queries. Currently invisible at the page-title level.
- **How:** Create `src/app/categories/layout.js` with a `metadata` export (same pattern as `categories/[slug]/layout.js`).
- **Effort:** S | **Risk:** low | **Phase:** 1 or 2

### P1-5 — Collections listing page is missing metadata

- **What:** Same problem as P1-4. `src/app/collections/page.js:17-20` has the metadata commented out with the note `// Removed due to "use client"`. Solution: lift to a new `src/app/collections/layout.js`.
- **Effort:** S | **Risk:** low | **Phase:** 1 or 2

### P1-6 — Warranty page metadata is incomplete

- **What:** `src/app/warranty/page.js:4-7` has only `title` and `description`. No `openGraph`, no `twitter`, no `canonical`, no `robots`.
- **Why:** Inconsistent with the rest of the site. OG previews on social shares of this page will fall back to root.
- **Effort:** S | **Risk:** low | **Phase:** 2

### P1-7 — Blog post pages have no `generateMetadata`

- **What:** `src/app/blog/[slug]/page.js` has no `generateMetadata` function. Each blog post inherits parent metadata, so every post in SERPs shows the blog index title and description.
- **Why:** Catastrophic for blog SEO. Each post needs its own title (`post.title.rendered`), description (`post.excerpt.rendered`), OG image (`featuredMedia.source_url`), canonical, and publish/modified dates.
- **Bonus:** Add `Article` JSON-LD while we're there — author, datePublished, dateModified, image, mainEntityOfPage. AIO win.
- **Also:** Blog is currently route-blocked per `CLAUDE.md` ("until ready for launch"). Worth confirming — current `src/middleware.js` does *not* block `/blog` (only geo-blocks). Either the docs are out of date or the route is open and just unannounced.
- **Effort:** M | **Risk:** low | **Phase:** 2
- **Open question (Q-4):** Is the blog live/indexable, or should `/blog` and `/blog/[slug]` be `noindex` until content is ready?

### P1-8 — Dynamic OG image generator

- **What:** Replace the single static `/images/banner-1.jpg` (used as OG image on 8+ pages) with `opengraph-image.js` route handlers that render branded OG images per-page using `next/og`'s `ImageResponse`. For products, render product image + name + price. For categories, category name + hero image. For the homepage, banner + tagline.
- **Why:** Every page sharing the same OG image looks lazy and reduces CTR on Twitter/LinkedIn/iMessage/Slack/Discord shares. Per-page OG images dramatically improve social-share CTR (documented 20–50% lift on most e-commerce).
- **Effort:** L | **Risk:** medium (new image rendering pipeline) | **Phase:** 2

### P1-9 — Middleware: explicitly exclude `robots.txt` and `sitemap.xml`

- **What:** Update the matcher in `src/middleware.js:52-54` from:
  ```js
  '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ```
  to:
  ```js
  '/((?!api|_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|llms\\.txt|llms-full\\.txt).*)'
  ```
- **Why:** Defensive. Googlebot is US-based so it's not currently blocked, but Bingbot, Yandex, regional crawlers, and various AI bots may have edge cases. Cheap insurance.
- **Effort:** S | **Risk:** low | **Phase:** 1

### P1-10 — `next.config.mjs` is missing modern image config

- **What:** Current config (`next.config.mjs:3-5`) uses deprecated `images.domains`. Should use `images.remotePatterns`. Also missing `formats: ['image/avif', 'image/webp']`, `deviceSizes`, `imageSizes` tuning, and `minimumCacheTTL`.
- **Why:** AVIF/WebP serving improves LCP. Deprecated `domains` will eventually be removed.
- **Effort:** S | **Risk:** low (Next.js handles fallback if formats unsupported) | **Phase:** 2

### P1-11 — Footer has no business/E-E-A-T signals

- **What:** `src/app/components/Footer.jsx` is minimal — logo, link list, copyright. No business address, no phone, no business hours, no social profile links, no payment method icons.
- **Why:** Trust signals affect both SEO (E-E-A-T) and conversion. Address also feeds local SEO if a physical retail presence is relevant (the warranty page references a now-commented-out Garden City, ID address — confirm whether to include).
- **Open question (Q-5):** Is there a public business address? Customer support phone? Social profiles beyond Instagram?
- **Effort:** S–M | **Risk:** low | **Phase:** 2

### P1-12 — About page has duplicate H1s

- **What:** `src/app/about/page.js:66-71` renders two `<h1>` elements in the hero:
  ```jsx
  <h1 className="hero-heading">Work can be shitty.</h1>
  <h1 className="hero-heading">Your clothes don't have to be.</h1>
  ```
- **Why:** Spec says one H1 per page. Google tolerates multiple H1s in HTML5, but it's still considered a quality smell and LLMs use H1 to identify the page's primary topic — splitting it weakens the signal.
- **Fix:** Combine into one H1 with a `<br>` or single string; demote the second to `<p>` or `<h2>`.
- **Effort:** S | **Risk:** low | **Phase:** 2

### P1-13 — Cart page has 3 identical H1s

- **What:** `src/app/cart/page.js:199, 221, 250` — three `<h1>Your Cart</h1>` (in three different render branches: loading, empty, populated). Only one is rendered at a time, so this is *technically* fine, but worth verifying no edge case shows two.
- **Why:** Verify-only. Note for review.
- **Effort:** S | **Risk:** low | **Phase:** 2

### P1-14 — Partner industry logos link to `href="#"`

- **What:** `src/app/partners/page.js:92,101,110,119,128,137` — all six industry partner logos are wrapped in `<a href="#">`.
- **Why:** Links to `#` are dead links from a crawler's perspective and can leak ranking signals to the page itself in a self-referential loop. Also a UX issue (clicking does nothing useful).
- **Fix:** Either remove the `<a>` wrappers entirely or link to the partner's actual site with `rel="noopener noreferrer nofollow"`.
- **Effort:** S | **Risk:** low | **Phase:** 2

---

## 5. Findings — Priority 2 (refinements; lower impact but worth doing)

### P2-1 — Add `manifest.js` (PWA web app manifest)

- **What:** `src/app/manifest.js` declaring name, short_name, theme_color, icons. Low SEO impact but good polish + enables "Add to Home Screen" on mobile.
- **Effort:** S | **Risk:** low | **Phase:** 2

### P2-2 — Replace static `keywords` field everywhere

- **What:** Google has ignored the meta `keywords` tag since ~2009. Every page metadata file has one. Harmless but unnecessary code surface.
- **Why:** Code hygiene; not an SEO win, just simplification.
- **Effort:** S | **Risk:** low | **Phase:** 3 (or skip)

### P2-3 — Verify `dangerouslySetInnerHTML` is sanitized

- **What:** 8 files use `dangerouslySetInnerHTML`. The project has `isomorphic-dompurify` installed. Need to verify each usage passes through `DOMPurify.sanitize()` before injection. Files:
  - `src/app/components/shop/SingleProduct.jsx` (product description)
  - `src/app/blog/[slug]/page.js` (blog title + content)
  - `src/app/components/shop/ProductReviewsSection.jsx`
  - `src/app/categories/[slug]/page.js` (category description)
  - `src/app/collections/[slug]/page.js` (collection description)
  - `src/app/components/blog/FeaturedBlogPost.js`
  - `src/app/components/blog/BlogPostItem.js`
- **Why:** Security, not SEO. But security incidents affect SEO (Google flags compromised sites). Out-of-scope for this audit but worth flagging.
- **Effort:** M | **Risk:** medium (changes input handling) | **Phase:** 3 (security review)

### P2-4 — Heading hierarchy on home & shop is shallow

- **What:** Homepage has no visible H1 in any of the rendered components (HeroSlideshow is text-overlay only, FeaturedSection starts with H2 inside FeaturedProducts). Shop page H1 is commented out.
- **Why:** A page without an H1 is a "missing top-of-hierarchy" signal. Lighthouse will flag it.
- **Fix:** Add an SR-only H1 to the homepage and shop page so the document outline is correct without changing the visual design.
- **Effort:** S | **Risk:** low | **Phase:** 2 (overlaps with P0-6)

### P2-5 — Image alt text scan

- **What:** Spot-checked every component I read; all `next/image` uses have meaningful alt text. Recommend running an automated audit (e.g. `axe-core` via Lighthouse) over a representative sample of rendered pages to confirm coverage in components I didn't read.
- **Effort:** S (run lighthouse) | **Risk:** low | **Phase:** 2

### P2-6 — Internal linking depth

- **What:** Navbar covers top-level; Footer covers same. Few contextual cross-links between products, categories, collections, and content pages. No related-products section on product page (need to verify in full `SingleProduct.jsx`). Category pages have no copy/links to related collections.
- **Why:** Internal linking distributes PageRank and gives crawlers more paths to deep pages.
- **Effort:** M–L | **Risk:** low | **Phase:** 3

### P2-7 — Hero slideshow accessibility & SEO

- **What:** `HeroSlideshow.jsx` renders only the *current* slide's image. Other slides' headings/subheadings are in JSX but invisible to crawlers unless rendered. Verify: are non-current slides' text actually in the DOM but hidden, or conditionally not rendered? If the latter, only the first slide's content is indexed.
- **Effort:** S (verify) + S (fix) | **Risk:** low | **Phase:** 2

---

## 6. Findings — Priority 3 (higher risk; performance / architecture; do last)

These are where the *previous* SEO overhaul probably broke things. Save these for after measurements show they're needed.

### P3-1 — Convert `"use client"` pages to server components where possible

- **What:** 47 files use `"use client"`. Many *need* it (forms, useState, interactivity). Many *don't*:
  - `src/app/components/Footer.jsx` — pure static render. The `currentYear = new Date().getFullYear()` could happen at render time on the server (and would auto-update on rebuild without client JS).
  - `src/app/components/FeaturedSection.jsx` — only uses client because it switches between two variants based on `newProductConfig`. The config is static; this decision could happen at build time.
  - `src/app/components/ProductCategories.jsx` — uses `useState` for hover (Tailwind `group-hover:` could replace it) and `useEffect` for mobile detection (Tailwind responsive utilities could replace).
  - `src/app/components/shop/ProductGrid.jsx` — receives `products` as a prop; only uses client for the special-case review fetch for product 5403.
  - `src/app/components/shop/SingleProduct.jsx` — needs partial client (Carousel, ProductActions) but the H1 with product name should be server-rendered. Currently the whole component is client.
- **Why:** Smaller JS bundles → faster LCP/FID → better Core Web Vitals → ranking signal. AIO impact: many LLM crawlers do NOT execute JS, so content rendered only client-side is invisible to them.
- **Risk:** High. This is exactly the kind of refactor that broke things last time. Approach: one component per change set, with screenshots before/after, full smoke test (homepage, shop, product, category, collection, cart, checkout) between each.
- **Effort:** L (per component) | **Risk:** high | **Phase:** 4

### P3-2 — Product detail page should be server-rendered

- **What:** Most critical case of P3-1. `SingleProduct.jsx:1` is `"use client"` and renders the H1 with product name client-side. Split into:
  - Server: title H1, description, JSON-LD, primary image, breadcrumbs, related products
  - Client: ProductActions (variation selectors, add-to-cart), image carousel, reviews fetcher
- **Why:** Critical SEO + AIO. Product pages are the #1 ranking-target pages on e-commerce sites.
- **Effort:** L | **Risk:** high | **Phase:** 4

### P3-3 — Category & collection slug pages should be server-rendered

- **What:** `src/app/categories/[slug]/page.js` and `src/app/collections/[slug]/page.js` are `"use client"`. The category name, description, and H1 are all client-rendered. Same split strategy as P3-2: server-render the header + description + JSON-LD, client-render only the interactive filters / sort / mobile sidebar.
- **Effort:** L | **Risk:** high | **Phase:** 4

### P3-4 — Inline styles → CSS classes

- **What:** Heavy use of inline `style={{}}` objects across pages and components. Each inline style is a unique attribute that prevents some browser optimization paths and bloats HTML.
- **Why:** Minor — but as a brand-new site grows, bundle size and HTML size compound. CLS can also be affected if dimensions are inline vs. classed.
- **Effort:** L | **Risk:** medium (visual regression) | **Phase:** 4

### P3-5 — Compression and security headers

- **What:** `next.config.mjs` doesn't set `compress: true` (default is true, so this is OK) or any `headers()` for CSP, HSTS, X-Content-Type-Options, etc.
- **Why:** Security headers don't directly affect SEO but Google factors page-experience signals (HTTPS, no security warnings). HSTS is the most relevant.
- **Effort:** S | **Risk:** medium (CSP can break inline scripts) | **Phase:** 4

### P3-6 — Sitemap improvements

- **What:** Current `sitemap.js` is functional but could be improved:
  - All non-product routes share `lastModified: new Date()` (always "now"). Crawlers may de-prioritize after noticing every URL is "always fresh."
  - No `changeFrequency` or `priority` hints (these are advisory but used by some crawlers).
  - No image sitemap entries.
  - Could split into multiple sitemaps via sitemap index for scale.
- **Effort:** M | **Risk:** low | **Phase:** 3

### P3-7 — Blog `dangerouslySetInnerHTML` on title

- **What:** `src/app/blog/[slug]/page.js:107` uses `dangerouslySetInnerHTML` for the H1. If WordPress titles ever contain `<script>` or other malicious markup, this is an XSS vector. The custom `decodeHtmlEntities` function only handles entities, not tags.
- **Fix:** Pass title through DOMPurify, or use `post.title.rendered` as plain text + `decodeHtmlEntities`.
- **Effort:** S | **Risk:** medium (changes title rendering) | **Phase:** 3

---

## 7. Baseline measurements to capture *before* Phase 1

Before any Phase 1 code changes, capture these so we can measure impact:

1. **Google Search Console (GSC)** — for each of: homepage, `/shop`, top 3 products, `/about`, `/in-the-wild`:
   - Impressions, clicks, avg position (last 28 days)
   - Top queries
2. **Rich Results Test** (https://search.google.com/test/rich-results) — run on:
   - `https://www.mantle-clothing.com/`
   - One product page
   - One category page
   - One collection page
   - `/about`, `/in-the-wild`, `/warranty`
   - Expected result: no rich results detected → confirms the "zero structured data" finding
3. **PageSpeed Insights** (https://pagespeed.web.dev) — same URL set. Capture mobile + desktop scores, LCP, CLS, INP.
4. **Lighthouse SEO audit** — run locally or via Chrome DevTools on the same URL set.
5. **Schema validator** (https://validator.schema.org) — same URL set.
6. **Manual SERP snapshots** — Google `site:mantle-clothing.com` and capture how each page renders in SERP today (screenshot).
7. **AIO baseline** — Ask Claude, ChatGPT, and Perplexity: "What is Mantle Clothing? What products do they make?" Capture answers. (These will improve dramatically after P0-1, P0-2, P0-5 ship.)

**Suggested:** Save baseline as `SEO_BASELINE_2026-05-12.md` in the repo. After Phase 1 ships, re-run and compare in `SEO_PHASE1_RESULTS.md`.

---

## 8. Recommended phasing & sequencing

### Phase 1 — Pure additions (target: 1–2 working sessions)

Items: **P0-1, P0-2, P0-3, P0-4, P0-5, P0-6, P0-7, P0-8, P1-4, P1-5, P1-9**

What ships:
- `src/app/robots.js`
- `public/llms.txt` + `public/llms-full.txt`
- New JSON-LD components: `OrganizationJsonLd`, `WebSiteJsonLd`, `ProductJsonLd`, `BreadcrumbsJsonLd` (all server components, all additive)
- Visible/invisible H1s restored on shop, category, collection
- Brand-language cleanup (remove "sustainable" / "eco-friendly")
- New `src/app/categories/layout.js` and `src/app/collections/layout.js` for metadata
- Middleware matcher hardened

Verification gate before Phase 2:
- Build passes
- All P0 pages visually unchanged (or H1 change explicitly approved)
- Rich Results Test now shows Product / Organization / BreadcrumbList valid
- Schema validator clean
- Smoke-test cart/checkout (no regressions)

### Phase 2 — Metadata refinements + content schema (target: 1–2 sessions)

Items: **P1-1, P1-2, P1-3, P1-6, P1-7, P1-8, P1-10, P1-11, P1-12, P2-1, P2-4, P2-5, P2-7**

What ships:
- FAQ schema on warranty/about/contact/partners
- ItemList schema on shop/category/collection
- Title template across all pages
- Warranty metadata completion
- Blog `generateMetadata` + Article schema
- Dynamic OG image generator
- Image config modernized
- Footer business signals (pending Q-5 answers)
- Manifest

Verification gate:
- All metadata renders correctly in `<head>` (view-source check)
- OG images preview correctly on Twitter Card Validator, LinkedIn Post Inspector, FB Sharing Debugger
- Build size hasn't ballooned

### Phase 3 — Content depth + sitemap polish (target: 1 session)

Items: **P2-2, P2-3, P2-6, P3-6, P3-7**

What ships:
- Sitemap improvements
- Internal linking pass on product pages (related products if missing)
- Sanitization audit on dangerouslySetInnerHTML
- Blog title XSS fix

### Phase 4 — Performance & RSC conversions (target: 2–3 sessions, one component at a time)

Items: **P3-1, P3-2, P3-3, P3-4, P3-5**

What ships:
- Product page server-component split
- Category/collection page server-component split
- Footer → server component
- Compression/security headers
- Inline styles → classes

**This is where last time broke. Strict discipline:**
- One component per PR
- Visual regression check (manual screenshots before/after for: home, shop, product, category, collection, cart, checkout)
- Cart flow smoke test after every change
- Roll back immediately on any production issue; do not "fix forward"

---

## 9. Open questions for greenlight before Phase 1

These need user answers before we can land Phase 1 cleanly:

- **Q-1:** What social profile URLs should `Organization.sameAs` include? Only Instagram (`instagram.com/mantle_clothing/`) is linked anywhere in the codebase. Facebook? YouTube? X/Twitter? LinkedIn? TikTok?

  Answer: Let's add Facebook as well. Profile URL = https://www.facebook.com/p/Mantle-Clothing-LLC-100063763260203/

- **Q-2:** AI bot policy in `robots.txt`. Allow all (recommended for e-commerce, maximizes AI citation rates) or selectively block any of: GPTBot, ClaudeBot, PerplexityBot, Google-Extended (controls AI Overviews), CCBot, anthropic-ai, cohere-ai, Meta-ExternalAgent, Applebot-Extended?

  Answer: Allow All

- **Q-3:** H1 restoration (P0-6) — visible H1 (matches design, ranking-positive) or `sr-only` H1 (invisible, neutral design impact)?

  Answer: lets go with 'sr-only'

- **Q-4:** Blog status (P1-7) — currently rendered and crawlable. Is it ready to be indexed, or should `/blog` and `/blog/[slug]` get `noindex` until content lands? `CLAUDE.md` says blog is "blocked until ready for launch" but the middleware doesn't actually block it.

  Answer: The CLAUDE.md file contains out of date information. The blog is live and there is a piece of content up. Let's makes sure crawlers can recognize the blog.


- **Q-5:** Business contact info (P1-11) — is there a public business address, support phone, and any social profiles beyond Instagram to include in footer + Organization schema?

  Answer: All contact with the business is conducted through the contact forms on the website.

- **Q-6:** Brand color / theme for dynamic OG images (P1-8) — confirm `#9CB24D` (the green I see throughout the code) is the brand primary, and what logo asset to use.

  Answer: yes, that's the green for now... though it seems that lighthouse doesn't like the color, and i've just been too lazy to update it. The logo asset is located in the public/images directory. There is a small image 'logo.svg' and a large image named 'MANTLE_LOGO.svg' 

---

## 10. What this audit *intentionally* did not cover

So you know the gaps:

- **Server-side performance benchmarks.** I didn't measure actual LCP/CLS/TTFB. Phase 0 measurement step (§7) captures those.
- **Search Console data.** I have no access; the data is in your GSC account.
- **Content depth review.** I didn't critique copy quality or topical coverage — only structural SEO. A separate content audit would assess whether category pages need long-form copy, whether you need pillar pages targeting "tactical pants for law enforcement", etc.
- **Backlink profile.** Off-page SEO is out of scope for a code audit.
- **Competitor analysis.** Not part of this audit.
- **Conversion / CRO.** Not part of this audit — but P1-11 (E-E-A-T) overlaps.
- **A/B testing infrastructure.** Not present in the codebase, not in scope.

---

## 11. Summary of what I touched in this audit

This audit produced this single file (`SEO_AUDIT.md`) and made zero other code changes. No new dependencies, no edits to existing files, no new components, no config changes. Greenlight Phase 1 (or any subset of P0/P1 items) when ready.
