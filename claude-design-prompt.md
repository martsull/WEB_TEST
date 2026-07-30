# Creative Brief: task.by Redesign Concept — ЗАСО «ТАСК» Insurance Company

## Role and mission

You are acting as a Senior Product Designer and Creative Director at an enterprise UX studio. You have been given a completed UX/UI, SEO, accessibility, and mobile technical audit of **task.by**, the corporate website of **ЗАСО «ТАСК»** — an insurance company operating in the Republic of Belarus since 1991. Your job is to produce a **presentation-ready visual redesign concept** that will be shown directly to the client's stakeholders (executives, marketing, digital team) as a demonstration of "what the next generation of task.by could look like."

This is **not** a full site rebuild and **not** a from-scratch reinvention. It is a **concept demonstration**: a small, carefully chosen set of key pages, executed to a very high visual and interaction standard, that together prove out a reusable design system and a coherent product/UX strategy. Every single design decision you make must be traceable to a finding in the audit summarized below. Do not invent problems that were not found. Do not redesign things that already work well. Preserve what is strong; fix, precisely and confidently, what is broken.

Treat this brief as your complete source of truth. It contains the business context, the audit findings, the page selection (already made for you, with rationale), the visual direction, the design system requirements, the UX fixes required, the new functionality to design, and the deliverables expected. You should be able to execute the full concept from this document with no further clarification needed.

**Live site reference:** https://task.by/ — if you have the ability to browse it, use it only as a secondary reference for verifying exact current colors, fonts, copy, and page content not fully captured in the audit's screenshots (e.g., pages beyond the 8–25 audited templates). It must never override the audit: the live site is not the source of truth for what problems exist or how to prioritize them — the findings in Section 2 are. If you cannot browse it, the audit content and screenshots described throughout this brief are sufficient to execute the full concept.

---

## 1. Business context

**Company:** ЗАСО «ТАСК» — a closed joint-stock insurance company (страховое общество), operating in Belarus since **1991**, one of the older private insurers on the market. Legal seat: Minsk, ul. Червякова, 46. The company sells personal-lines insurance (auto KASKO/OSAGO, property, health/travel) and corporate-lines insurance (transport, property, liability, health) directly and through 11 regional representative offices across Belarus (Minsk ×4, Brest, Baranovichi, Vitebsk, Gomel, Grodno, Mogilev, and a loss-adjustment department).

**What the site does, functionally:**
1. **Product showcase** — informs private individuals and legal entities about insurance products and published tariffs.
2. **Legal/reference portal** — licenses, statutory details, bank requisites, disclosure documents (a real regulatory requirement in insurance, and a genuine trust asset when done well).
3. **Entry point to online services** — personal client account (личный кабинет), online OSAGO issuance, ЕРИП payment, claim-reporting information.

**Target audience:** broad and skewing older — private car owners buying mandatory/voluntary auto insurance (OSAGO/KASKO), property and health/travel insurance buyers, corporate clients and procurement officers, and government counterparties (the site also serves a B2G/regulatory-transparency function). Design decisions must respect an audience that is not uniformly digitally native: clarity, legibility, and large, obvious interactive targets matter more here than trend-chasing visual flourish.

**Overall audit verdict:** Combined UX and technical score **4.5–4.8 / 10**. The site is functionally stable, legally complete, and has a sound, predictable information architecture — but it visually and behaviorally reads as **2012–2015-era web design**, has almost **no path to conversion** on product pages, and loses its primary contact channel (phone) entirely on mobile. The single biggest opportunity is not a cosmetic refresh — it is turning an "information warehouse" into a **selling channel**, while preserving the IA, legal transparency, and content the audience already relies on.

---

## 2. Audit findings that must drive every design decision

Findings are grouped by business impact, exactly as ranked in the audits (`audit/report.md` — UX/UI/CRO/Accessibility; `technical-audit/final-report.md`, `seo-report.md`, `accessibility-report.md`, `mobile-report.md` — technical/SEO/WCAG). Use these as your design rationale; **cite them implicitly through your solutions**, and where you present the concept, explicitly name which finding each solution addresses.

### Critical — conversion-breaking
- **No "buy" or "get a quote" CTA on product pages.** The KASKO product page (`/person/auto/kasko/`) is ~4000px of detailed, well-organized product content — risks covered, coverage options, a full tariff table — and the *only* interactive element on the entire page is a "Страховой случай" (claims) button, which is for existing policyholders reporting an accident, not for buying a policy. A user who has read the tariffs and is ready to buy has no next step except finding a phone number themselves. This pattern repeats across product pages; note that `/person/auto/osago/` **does** have a working "Оформить полис онлайн" CTA (370×64px), proving the pattern already exists on the site and simply needs to be extended consistently — this is a template/consistency fix, not a from-scratch invention.
- **Mobile has no phone number anywhere.** Desktop shows `(+375 17) 363-24-02` prominently in the header. On the 390px mobile viewport, the header shows only the logo and hamburger icon; the open menu shows no phone number either — only "Вход" (login). Confirmed via DOM audit: **zero** `tel:` links exist anywhere on the site, even on the Contacts page where numbers are shown as plain text. For an insurance product bought heavily by an older, phone-preferring audience, this is a direct loss of the primary conversion channel on the majority (mobile) of traffic.
- **KASKO tariff table is clipped on mobile with no scroll affordance.** The table renders at 760px actual width inside a 370px container on a 390px viewport (confirmed via `getBoundingClientRect`). Only 2 of 5 pricing columns are visible; text is cut mid-word; there is no shadow, arrow, or "1/5" indicator hinting that more content exists off-screen. Users are likely to conclude the site is broken or that no suitable tariff exists, and leave.

### High — trust and usability
- **"О компании" (About) has zero trust content.** The entire page is legal boilerplate: registered address, registration number, bank requisites, УНП/ОКПО, one email link. No history, no mission, no numbers (years on market, clients served, claims paid), no photos of leadership or offices, no awards/certifications — despite the company having a genuinely strong trust asset (operating since 1991) that is currently stated nowhere on the page. A separate "Первые лица" (leadership) section exists elsewhere on the site but is not visually connected to this page.
- **Contacts page is an undifferentiated wall of text.** All 11 regional offices are listed as one continuous text flow (~3850px desktop / ~4580px mobile) with no map, no city filter/selector, and no card-based visual separation. Users must manually scan the entire list to find their nearest office.
- **Systemic duplicate link blocks.** The same list of insurance sub-types is rendered twice on category pages (once as an icon widget, once again as a plain link list directly below it), confirmed on `/person/property/`, `/corporate/`, and `/person/auto/kasko/`. This is a template-level defect, not a one-off — fixing it once fixes it site-wide.
- **Mobile hero is visually broken.** The desktop hero (car illustration + speech-bubble product list + human silhouettes) is compressed into mobile with no dedicated mobile layout: headings, a raw link list, and an illustration with silhouette outlines stack in one undifferentiated vertical flow with no cards, spacing, or hierarchy. This is the first thing the majority (mobile) of visitors see.
- **Outdated desktop hero illustration with no CTA.** The homepage's central visual is a clip-art car, outline silhouettes of people, a red "speech bubble" of text links, and a circular arrow button — a mix of disconnected graphic styles associated with 2010s template sites, occupying the highest-attention zone of the page (F-pattern) without a single action button.

### Medium — content and accessibility
- Body copy renders at **14px** with 1.29 line-height (below the recommended 1.5) and unconstrained line length (`max-width: none`), producing 100+ character lines on wide desktop viewports — this is especially costly for an older audience reading dense insurance terms.
- FAQ is a list of hyperlinks that navigate away, not an accordion — comparing multiple answers requires repeated back-navigation.
- Site search is hidden at the very bottom of the footer, below payment logos and legal text — effectively undiscoverable, despite a 20+ product catalog that benefits from search.
- Small tap targets (15–27px height) in the mobile Contacts quick-links block and footer menu, below the 44×44px recommended minimum.

### Accessibility (WCAG 2.2) — real severity masked by a misleadingly average Lighthouse score (84.7–85.1/100)
- Off-canvas mobile menu remains **fully keyboard-focusable while visually hidden** (127 interactive elements ahead of visible content in tab order, no `aria-hidden`/`inert`) — keyboard and screen-reader users must tab through the entire menu before reaching page content, on every single page.
- Login/password fields on `/personal/` are **not programmatically associated with their labels** (visual labels are `<div>`s, not `<label for="...">`) — the site's one full form is inaccessible to screen-reader users.
- Breadcrumb text contrast is **2.77:1** against a 4.5:1 requirement, on 24 of 25 pages checked.
- Global `outline: 0` removes visible focus indication for all links/buttons sitewide with no replacement — keyboard-only navigation is effectively unusable.
- No `<main>` landmark or skip link on any of the 25 pages checked — screen-reader users re-hear the full header/nav on every page load.
- Search submit button has no accessible name on all 50 checked template instances (25 pages × mobile/desktop).
- Heading level skipped (H1 → H3, no H2) on 16 of 25 pages, mostly product pages.

### SEO / technical (supporting context only — do not let this drive visual design, but respect it in structure)
- `/person` is byte-identical to `/person/property`; `/corporate` is byte-identical to `/corporate/transport` — the "Частным лицам" / "Корпоративным клиентам" root sections have **no dedicated overview/landing page** of their own; visiting the top-level nav item silently redirects to the first sub-category.
- Meta description is 100% identical across the entire site; no canonical tags; no Open Graph/Twitter Card tags (relevant for a market where links are heavily reshared via Viber/Telegram); no JSON-LD; breadcrumbs use the deprecated `data-vocabulary.org` microformat instead of `schema.org/BreadcrumbList`.
- Lowest mobile Performance score is the homepage at 75/100 (Lighthouse); desktop performance is healthy (96–98/100) across the board. GTmetrix grades the homepage "B" (85/100 GTmetrix score, LCP ~1.8s, CLS 0.12 — the CLS is worth noting as a symptom of unstyled/late-loading hero content).

### What already works — preserve, do not "fix"
- A deep, predictable, consistent section hierarchy (Частным лицам / Корпоративным клиентам / О компании / Пресс-центр / Контакты) repeated identically across the whole site — genuinely good, stable IA.
- A large volume of accurate legal/reference content (licenses, requisites, tariffs, downloadable PDFs) — essential for regulatory trust in insurance and must not be stripped out or buried in the redesign, only better organized and typeset.
- Online services already exist in some form: personal account login, online OSAGO issuance, ЕРИП payment, e-services — the redesign should surface and modernize these, not replace them with speculative new systems.
- The personal-account login form (`/personal/`) is a clean, standard, functionally correct auth pattern (aside from the label-association accessibility bug) — use it as the reference for the form system, not as a page requiring a conceptual redesign.
- OSAGO's existing "Оформить полис онлайн" CTA pattern is proof the organization already knows how to do this — extend it, don't reinvent it.

---

## 3. Selected pages for the redesign concept (5 pages)

Automatically determined from the audit findings, chosen to (a) cover the highest business-impact problems, (b) collectively demonstrate every major template type on the site so the client can extrapolate the full site from these five pages, and (c) each stand as a strong, presentable "wow" moment on its own.

### 1. Homepage (`/`)
**Why selected:** First point of contact for all traffic; sets the "private individuals vs. corporate clients" fork; contains the most visually dated single element on the site (clip-art hero) with zero CTA in the highest-attention zone; its mobile version is the single worst mobile layout found in the audit (unstructured stacked content, no phone number, broken-looking hero).
**Business purpose:** Brand first impression, audience segmentation (person vs. corporate), top-of-funnel entry into product lines.
**UX/UI problems demonstrated:** outdated hero illustration with no CTA; mobile hero visual breakdown; hidden footer search; no click-to-call; weak visual hierarchy/trust signals above the fold.
**Why it delivers the greatest value:** It is the page every stakeholder will look at first when judging "did the redesign work" — and it is where the contrast between "2012 template" and "2026 enterprise" will be most visually obvious and persuasive.

### 2. Product page — АвтоКаско (`/person/auto/kasko/`)
**Why selected:** The single most conversion-critical page on the site (per the audit's own #1 finding) and structurally representative of every other product page (OSAGO, property, health, corporate lines) on the site.
**Business purpose:** Converts an informed, high-intent visitor into a lead or a completed policy purchase.
**UX/UI problems demonstrated:** total absence of a purchase/quote CTA; mobile tariff table clipped with no scroll affordance; dense, uninterrupted text blocks; 14px body copy; no visual differentiation of coverage options/tariff tiers.
**Why it delivers the greatest value:** This is the page where the redesign must prove it can turn "informational" into "transactional" — the calculator/CTA pattern demonstrated here is the template every other product page will inherit.

### 3. Audience hub — "Частным лицам" (`/person/`)
**Why selected:** Currently not a real page — it silently redirects to (and is byte-identical to) `/person/property/`, meaning the site's single most-clicked top-level nav item has no page of its own. The audit flags this as both an IA/SEO defect and a duplicate-content template bug repeated on the corporate side (`/corporate/` ≡ `/corporate/transport/`).
**Business purpose:** Orient a visitor who knows only "I am a private individual" (not yet which product) toward the right product family; the corporate equivalent serves B2B/procurement visitors.
**UX/UI problems demonstrated:** missing landing page for a root IA node; duplicate link-block rendering (same list shown twice on the page it currently redirects to); poor scannability of the product catalog.
**Why it delivers the greatest value:** It shows the client how to fix a structural IA gap without inventing new navigation — the redesign should design the landing page this section always should have had, while explicitly preserving the existing category tree beneath it (Транспорт/Здоровье/Финансы/Имущество/Ответственность for corporate; Имущество/Автострахование/Здоровье for person).

### 4. О компании (`/about/`)
**Why selected:** The audit identifies this as the page with the largest gap between its business purpose (build trust in a financial institution) and its actual content (pure legal boilerplate, zero emotional or credibility content) — for an insurer, the "why should I trust you with my risk" page is disproportionately important relative to its current one-screen, all-text execution.
**Business purpose:** Converts trust-seeking visitors (often researching before purchase, or comparing insurers) into confident buyers by answering "is this company real, established, and reliable."
**UX/UI problems demonstrated:** complete absence of trust signals (no history, numbers, people, awards, partners); no visual connection to the existing-but-disconnected "Первые лица" (leadership) content; undifferentiated legal-document-style typesetting for what should be a credibility narrative.
**Why it delivers the greatest value:** It is the cheapest possible high-impact fix to show a client — the company already has the underlying facts (founded 1991, 11 regional offices, licensed, reinsurance-backed); the redesign simply needs to *tell that story*, which is a content-hierarchy and layout problem, not a content-creation problem.

### 5. Контакты — «Адреса и телефоны» (`/contact/adresa_i_telefoni/`)
**Why selected:** Highest-intent page on the site (a visitor here has already decided to call or visit) and one of the clearest, most demonstrable UX failures: 11 offices as one undifferentiated text stream with no map or filter, ~3850–4580px of scroll.
**Business purpose:** Converts users who prefer offline/phone/in-person channels — a meaningful share of an insurance company's older, higher-trust-requirement customer base — into an actual call or visit.
**UX/UI problems demonstrated:** wall-of-text layout with no cards/map/filter; non-clickable phone numbers (sitewide `tel:` absence is most visible here); small mobile tap targets in the quick-links block.
**Why it delivers the greatest value:** It is a compact, self-contained page where a card-based office-locator pattern can be fully realized and immediately understood by the client as "this is what modern looks like," while being trivial to extend to all 11 offices using the same component.

**Together these five pages cover every major template family on the site** (homepage, product/tariff template, category/audience landing, static content/trust page, and structured-data/contact template), so the client can reliably extrapolate the visual language to the remaining ~20 pages not explicitly mocked up.

---

## 4. Information architecture — preserve, do not restructure

Keep the existing top-level structure intact everywhere except the one specific gap identified above:

- Global header nav: **Частным лицам** / **Корпоративным клиентам**, plus secondary utility nav: О компании / Страхование в «ТАСК» / Пресс-центр / Сотрудничество / Контактная информация.
- Sidebar/quick-links block used sitewide: ОНЛАЙН страхование / Оплата через ЕРИП / Личный кабинет / Страховой случай / Заявка на медобслуживание / Точки продаж — preserve this set and its purpose; you may restyle it into a cleaner card or icon-list treatment, but do not remove or rename items without a stated reason.
- Footer's 7-column sitemap (О компании / Страхование в «ТАСК» / Частным лицам / Корпоративным клиентам / Пресс-центр / Сотрудничество / Контактная информация) — preserve the grouping; **do not** duplicate the same link list twice on any page (this exact defect is one of the audit's top findings).
- Breadcrumbs on every interior page — keep them, but fix the contrast (currently 2.77:1, needs ≥4.5:1) as part of the new type/color system.
- The one IA change you should make: give `/person/` and `/corporate/` real landing pages (see page 3 above) instead of leaving them as silent redirects/duplicates of their first sub-category. This is additive — you are filling a missing node, not restructuring the tree around it.

The goal: an existing user should be able to open the redesign and find everything exactly where they expect it, just executed with dramatically better visual and interaction quality.

---

## 5. Visual design direction

Design a **modern enterprise-grade interface**, comparable to leading international insurance/finance/enterprise websites released in 2025–2026. Target adjectives: premium, clean, elegant, minimal, timeless, trustworthy, highly readable, visually balanced, corporate, professional.

**Explicitly avoid:** flashy startup/SaaS aesthetics, unnecessary motion/animation, gradient-heavy decoration, oversized/full-bleed hero sections with disproportionate whitespace, generic stock-photo people, decorative clutter, glassmorphism, neon accents, or anything that reads as "trendy" rather than "durable."

**The design must not look templated.** Do not default to a generic Bootstrap/Tailwind-starter-kit layout, a stock SaaS-landing-page structure, or the visual patterns that make AI-generated interfaces instantly recognizable as such (centered hero + three feature icons + generic rounded cards + default blue-to-purple gradient + stock illustration of a person at a laptop). This is a named, established insurer with real brand equity (the red "Т" mark, the tagline, 35 years on the market) — the concept must look **specifically designed for ЗАСО «ТАСК»**, not like a template with the logo swapped in. Every layout, section rhythm, and compositional choice should be a deliberate response to this company's actual content (its products, its tariff structures, its 11 real offices, its regulatory documents) rather than a filled-in generic pattern. If a layout choice would look identical on an unrelated company's site with the copy swapped, reconsider it.

**Brand continuity:** ЗАСО «ТАСК»'s identity is built around a red circular "Т" logo mark and the tagline "Гарантия защиты Ваших интересов!" (Guarantee of protection for your interests). Keep the brand red as the primary accent/action color — it is recognized equity — but modernize it: define a precise, accessible red (verify ≥4.5:1 contrast against white for text use; use the raw brand red only for large surfaces/buttons/accents, never for body text or small UI at low weight). Retire the clip-art car/silhouette illustration style entirely; replace with either (a) clean, high-quality photography (real vehicles, real people, real Belarusian settings — not generic stock aesthetics) or (b) a restrained, geometric, single-line-weight illustration/icon system — pick one direction and apply it with total consistency, do not mix illustration and photography styles as the current site does.

**Typography:** move off the current mixed-weight, 14px-body, unconstrained-line-length system to a disciplined type scale (defined in the design system below) built on a clean, highly legible humanist/grotesk sans-serif appropriate for long-form insurance copy (something in the spirit of Inter, IBM Plex Sans, Public Sans, or a comparable Cyrillic-complete enterprise typeface — the audience reads in Russian, so full, well-hinted Cyrillic glyph support is mandatory, not optional).

**Tone reference:** think Allianz, Zurich, AXA, Munich Re, or a modern regional bank's 2025–2026 marketing site — restrained color use, generous but purposeful whitespace, strong grid discipline, confident and uncluttered typography, photography (or illustration) that feels institutional and human rather than decorative.

---

## 6. Design system requirements

Before designing individual pages, define and document a compact, reusable design system. Present it as a single reference sheet/page (a "style guide" screen) that precedes the page mockups, and apply it with zero deviation across all five redesigned pages.

- **Color palette:** primary brand red (accessible variant + a darker hover/active shade), a neutral grayscale ramp (backgrounds, borders, secondary text — at minimum 5–6 steps), a small set of semantic colors (success/confirmation, warning, error/critical, info) for form validation and status states, and defined text-on-color contrast pairs that all meet WCAG AA (4.5:1 body text, 3:1 large text/UI components) — explicitly fix the breadcrumb-contrast and low-contrast-accent findings from the audit as part of this palette.
- **Typography scale:** a modular scale from small print/caption up through H1, with defined weight, size, and line-height for each step. Base body size **minimum 16px**, body line-height **minimum 1.5**, and a **max content width for text blocks of roughly 720–800px** to keep line length in the 50–75 character range — this directly resolves the audit's readability finding.
- **Spacing system:** a consistent spacing scale (e.g., 4px or 8px base unit) applied to all padding/margin/gap decisions — used to fix the current inconsistent, dense, template-driven spacing seen sitewide.
- **Button system:** primary (brand red, high-emphasis — used for "Рассчитать стоимость" / "Оформить полис" type actions), secondary (outlined/neutral), tertiary/text-link, and disabled states; minimum touch target 44×44px; visible, on-brand focus ring (this directly replaces the removed global `outline:0` — accessibility must never regress from this system).
- **Input system:** text inputs, selects, and the login form pattern already validated on `/personal/` — each with visible, programmatically-associated `<label>` elements (fixing the audit's label-association finding), clear focus and error states, and helper/error text styling.
- **Cards:** a single card component used for product tiers, office locations, news items, and trust-signal tiles — consistent radius, elevation/border treatment, and internal spacing.
- **Tables:** a tariff-table component with a defined **mobile behavior** (do not simply let it overflow silently — either restack into per-row cards on narrow viewports, or keep horizontal scroll but add an explicit affordance: edge shadow, "swipe to see more" hint, or a segment/column selector). This is a direct, mandatory fix for the audit's #3 critical finding.
- **Icons:** one consistent icon set/style (stroke weight, corner radius, size grid) replacing the current mismatched iconography.
- **Badges:** for tags like "NEW," "Online," product categories, and office/status indicators.
- **Navigation:** header (desktop + mobile), mega-menu/dropdown pattern, breadcrumbs, footer sitemap, and a fixed/sticky mobile utility bar concept (see click-to-call below).
- **Footer:** single-instance sitemap (never duplicated on-page), legal/company info block, payment method logos, cookie settings link, and the site search field relocated out of the footer into the header (per the audit's findings on both).
- **Forms:** the calculator/quote wizard form pattern, callback-request form, and login form — one consistent visual and interaction language across all of them.
- **Modals:** for callback requests, quick quote summaries, or map/office detail overlays.
- **Alerts/inline notices:** used today for things like "specific terms for EVs/hybrids" callouts on the KASKO page — keep this pattern, just restyle it consistently.
- **Empty states:** e.g., FAQ search with no results, office filter with no matches.
- **Loading states:** for the calculator/quote wizard steps and office map.
- **Responsive behavior:** explicit breakpoint behavior for every component above — this system must work identically well at desktop (assume ~1440px design width, matching the audit's test viewport) and mobile (assume 390px, matching the audit's test viewport, with a secondary check at 360px).

---

## 7. Content approach

Preserve existing copy and information wherever it is factually complete and simply poorly presented (legal requisites, tariff figures, coverage lists, office addresses/phones/emails, the "Гарантия защиты Ваших интересов!" tagline, product names and category names). Your job is overwhelmingly **hierarchy, typography, and spacing**, not copywriting.

Rewrite or add copy only in these specific, justified cases:
- **About page:** you must originate short, credible trust-building copy (a brief history/mission statement, framed around the real fact that the company has operated since 1991) since none currently exists — keep it factual and restrained, not marketing hyperbole; label it clearly as representative/sample copy for the concept.
- **New CTAs and microcopy:** button labels ("Рассчитать стоимость", "Оформить полис онлайн", "Заказать звонок", etc.) — reuse the exact language already validated on the OSAGO page where possible for consistency.
- **New feature UI copy:** wizard step labels, calculator field labels, empty/error states — write these fresh since the components are new.

Do not invent new legal/financial figures (payout amounts, client counts, award names) that were not present in the source material — where the concept needs an illustrative number (e.g., "years on the market"), derive it from real, verifiable facts already in the audit (founded 1991) and mark any other illustrative statistic clearly as a placeholder for real client-supplied data (e.g., "[X] тыс. клиентов" style placeholder), so the client understands what they need to supply before production.

---

## 8. UX improvements required (mapped to audit findings)

Every one of these must be visibly solved in the relevant mockup:

1. **Weak/absent CTA hierarchy** → every product page gets one unmistakable primary action (see calculator/CTA feature below), placed both inline after the tariff section and as a persistent element while scrolling.
2. **Poor CTA visibility / no purchase path** → resolved via the quote calculator + sticky CTA described in section 9.
3. **Excessive undifferentiated text** → resolved via the type scale, constrained line length, card-based chunking of coverage options (already partially cards on KASKO — extend and refine, don't discard), and generous section spacing.
4. **Low trust (About page, no social proof)** → resolved via the About page redesign and a lightweight trust strip (years on market, office count, license/regulator mention) reused on the homepage.
5. **Confusing/missing navigation nodes** (`/person/`, `/corporate/` redirect-only) → resolved via the audience-hub landing page (page 3).
6. **Poor mobile experience** (broken hero, clipped table, no phone) → resolved via dedicated mobile hero layout, restacked/scrollable tariff table with affordance, and a persistent click-to-call element.
7. **Inconsistent spacing / weak visual rhythm** → resolved by strict application of the spacing scale and card system across all five pages.
8. **Poor readability** (14px body, 1.29 line-height, unconstrained width) → resolved by the typography scale (16px+/1.5+/720–800px max width).
9. **Inaccessible components** → resolved by: visible focus states everywhere (replacing `outline:0`), programmatically labeled form fields, `≥4.5:1` text contrast including breadcrumbs, `≥44px` tap targets throughout, and a `<main>`-landmark-friendly, single-column-of-focus mobile menu structure (visually demonstrate a menu state that would not trap 127 hidden focusable elements — e.g., a clean off-canvas panel design with clear open/closed states, since this is as much an interaction-design decision as an engineering one).
10. **Duplicate content blocks** → resolved by showing the audience-hub and product pages with each link list appearing exactly once.
11. **Hidden site search** → resolved by relocating search into the header on both desktop and mobile, styled as a first-class, always-visible utility.
12. **FAQ as link list, not accordion** → while FAQ is not one of the five core mockups, address it as a documented component in the design system section (accordion pattern with `aria-expanded` semantics implied in the visual states: collapsed/expanded/focused) so the client can see how it would look if extended sitewide.

---

## 9. New functionality to design (with justification)

For each feature, the rationale, user problem, business value, expected conversion/trust impact, target page, and integration approach are fixed below — design to this spec, do not add features beyond this list.

### A. Preliminary insurance cost calculator / quote estimator
- **Why:** The #1 critical audit finding is the total absence of a way to act on interest. The OSAGO page proves the org already has appetite for this pattern; KASKO and other products lack it entirely.
- **User problem solved:** "I've read the tariffs, I know roughly what I'd pay — now what?"
- **Business value:** Converts passive page views into measurable, capturable leads instead of relying entirely on inbound phone calls.
- **Expected impact:** Directly targets the audit's lowest-scored dimension (CRO, 3.1/10) — should be presented as the single highest-leverage change in the concept.
- **Trust impact:** A working, transparent price estimate (vs. "call us to find out") reads as more modern and less opaque.
- **Target page:** Product page (KASKO) — primary demonstration; describe it as the template pattern for every other product page.
- **Integration:** A short 2–4 field estimator (vehicle age, insured sum bracket, region) embedded directly below the tariff table, plus a persistent/sticky "Рассчитать стоимость" entry point while scrolling the page, opening the estimator inline or in a modal. Does not replace the tariff table — sits alongside it as the actionable counterpart to the informational content.

### B. Step-by-step policy application wizard
- **Why:** A single estimator gives a price; the company still needs a way to collect the buyer's actual application without forcing a phone call, consistent with the online-OSAGO capability the company already advertises elsewhere on the site ("ОНЛАЙН страхование").
- **User problem solved:** "I want to actually buy this online, not just get a number."
- **Business value:** Extends the existing "ОНЛАЙН страхование" capability visibly onto the product pages where buying intent is highest, rather than leaving it as a separate, disconnected sidebar link.
- **Expected impact:** Higher completion of started applications via a guided multi-step flow (vehicle/object details → coverage options → applicant details → summary) versus a single long form.
- **Trust impact:** Clear progress indication reduces the "how long is this going to take" anxiety typical of insurance purchase flows.
- **Target page:** Product page (KASKO), as the next step after the estimator (A).
- **Integration:** Present as a natural continuation of the quote estimator — "estimate → apply" — reusing the same visual form language defined in the design system, with a visible step/progress indicator.

### C. Sticky click-to-call / mobile contact bar
- **Why:** Directly resolves the audit's #2 critical mobile finding — zero `tel:` links sitewide and no phone number anywhere in the mobile header or menu.
- **User problem solved:** "I'm on my phone and I just want to call now."
- **Business value:** Recovers the primary conversion channel (phone) for the majority of traffic (mobile).
- **Expected impact:** Should be framed as a near-zero-cost, highest-ROI mobile fix in the presentation.
- **Trust impact:** A visible, tappable phone number signals a company that is reachable and current.
- **Target page:** Global — demonstrate in the mobile homepage and mobile product page mockups; a persistent bottom or header element with a real `tel:`-style call action.
- **Integration:** Add to the mobile header (compact) and, on high-intent pages like the product page and contacts page, as a fixed bottom bar alongside the primary CTA.

### D. Office/branch locator with map and city filter
- **Why:** Directly resolves the audit's Contacts wall-of-text finding.
- **User problem solved:** "Which of the 11 offices is closest to me, and how do I reach it?"
- **Business value:** Converts users who prefer offline/in-person or phone engagement — a meaningful segment for insurance — instead of losing them to scroll fatigue.
- **Expected impact:** Should cut time-to-find-nearest-office dramatically versus the current linear scan of an undifferentiated list.
- **Trust impact:** A map with real, tappable pins signals a substantial, established, physically present institution.
- **Target page:** Contacts (page 5).
- **Integration:** A city filter/selector above a two-column layout: map on one side, office cards (address, phone as a tappable element, email, hours) on the other, replacing the current plain-text list one-for-one in content, not in structure.

### E. Trust/credibility module ("about" strip + full About page)
- **Why:** Directly resolves the audit's About-page and homepage trust findings.
- **User problem solved:** "Can I trust this company with my money and my risk?"
- **Business value:** Reduces drop-off at the consideration stage, where insurance buyers actively compare providers before committing.
- **Expected impact:** Framed as addressing the audit's lowest-but-one trust score (4.3/10).
- **Trust impact:** Direct and primary purpose of this feature.
- **Target page:** About (full module: history/timeline, key numbers, leadership photos connected visually to the existing "Первые лица" content, license/regulator mention, partner/reinsurer logos placeholder); a condensed version (years on market + office count + license badge) reused as a homepage trust strip.
- **Integration:** Replaces the current single block of legal text with a structured page (hero statement → numbers/stats row → history → leadership → credentials/downloads for the legal documents that must remain, e.g., license, registration certificate), all of which already exist as content elsewhere on the site.

### F. Header-level site search with autosuggest
- **Why:** Directly resolves the audit's hidden-footer-search finding.
- **User problem solved:** "I know what product I want by name — let me just search instead of navigating the menu."
- **Business value:** Improves navigability of a 20+ product catalog, particularly for return visitors and corporate/procurement users looking for a specific document or product.
- **Expected impact:** Should reduce menu-dependent navigation friction; framed as a low-effort, sitewide fix.
- **Trust impact:** Minor but real — a visible, working search reads as more current/maintained.
- **Target page:** Global header — demonstrate in homepage and product page mockups (desktop and mobile).
- **Integration:** Standard header search icon/field, expandable on both breakpoints; removed from its current footer location (do not leave it duplicated in both places).

### G. Callback request ("Заказать звонок") micro-form
- **Why:** A lightweight complement to the phone-first behavior described throughout the audit — some users prefer being called back over calling in, especially outside business hours.
- **User problem solved:** "I don't want to call right now, but I want a human to reach out."
- **Business value:** Captures leads who would otherwise bounce without converting via either the calculator or a phone call.
- **Expected impact:** Secondary/supporting conversion path; smaller expected volume than the calculator but near-zero cost to add.
- **Trust impact:** Neutral to slightly positive — shows responsiveness options.
- **Target page:** Contacts page (as a secondary option alongside the office locator) and as a lightweight persistent option on the product page sidebar.
- **Integration:** A 2-field form (name + phone) using the same input system as the calculator/login forms — do not present it as a separate, inconsistent form pattern.

Do **not** design: document upload, claim-tracking, appointment booking, or downloadable-guide systems — none of these are supported by a specific audit finding, and the brief explicitly warns against adding trendy features without justification. The claims-reporting function ("Страховой случай") already exists and works; leave it conceptually as-is, just restyle its entry point consistently with the new button/card system.

---

## 10. Mobile experience requirements

Every one of the five pages must be designed at both desktop (~1440px) and mobile (390px, matching the audit's test viewport) with equal design effort — mobile is not an afterthought resize. Specifically:

- Homepage: a purpose-built mobile hero (not a compressed desktop hero) with a clear headline, one primary CTA, and a compact, single visual element — resolving the audit's "broken hero" finding directly.
- Product (KASKO) page: mobile tariff table must have an explicit, designed solution — either restacked per-row cards or horizontal scroll with a visible affordance (edge shadow/arrow/position indicator) — never silent overflow.
- All pages: sticky/fixed click-to-call element, header search, and touch targets ≥44×44px throughout (explicitly fixing the mobile Contacts quick-links and footer tap-target findings).
- Mobile navigation: design the off-canvas/hamburger menu's open and closed states clearly, including how the phone number and search are surfaced within it.

---

## 11. Accessibility requirements

Design to WCAG 2.2 AA as a baseline, addressing the specific gaps found in the audit, not generic best practice:

- All body text ≥4.5:1 contrast; large text/UI components ≥3:1. Explicitly fix breadcrumb contrast (was 2.77:1) and any low-contrast accent/date text.
- Every text input has a visible, associated label (not a styled `<div>`) — most important on the login and new calculator/callback forms.
- Every interactive element (links, buttons, form controls) has a visible focus state designed as part of the button/input system — this is the deliberate replacement for the site's current global focus removal.
- Touch targets ≥44×44px with adequate spacing between adjacent targets, especially in list/card-dense areas like the office locator and footer.
- Design the mobile menu's collapsed state so it is unambiguous that it should not remain in the tab order while closed (visually indicate a true off-canvas/hidden state, not just an overlay with 0 opacity).
- Maintain clear heading hierarchy (H1 → H2 → H3, no skipped levels) in the type scale and page layouts.
- Accordion/expandable components (referenced for FAQ) should be shown with clear expanded/collapsed visual states implying correct `aria-expanded` semantics.

---

## 12. Conversion optimization requirements

- Every product page has exactly one unmistakable primary CTA, visually distinct from secondary actions, present both inline and while scrolling.
- Trust and credibility signals (years on market, license, office count, real contact info) are visible near every conversion point, not only buried on the About page.
- Forms (calculator, wizard, callback, login) share one consistent, low-friction visual language: clear labels, inline validation states, minimal required fields per step.
- Phone numbers are always visible and tappable at the point of highest intent (product pages, contacts page, mobile globally).
- Information that currently causes hesitation (dense text, unclear tariff structure) is restructured for faster scanning and comprehension, directly supporting decision-making without removing any of the substantive content.

---

## 13. Expected deliverables

Produce a single, cohesive, presentation-ready concept containing:

1. **Design system reference sheet** — color palette, type scale, spacing scale, button/input/card/table/badge/navigation/footer/form/modal/alert/empty-state/loading-state specimens, shown once and referenced (not redrawn) throughout the rest of the concept.
2. **Desktop mockups** (~1440px) for all five selected pages: Homepage, Product (KASKO), Audience hub (Частным лицам), About (О компании), Contacts (Адреса и телефоны).
3. **Mobile mockups** (390px) for all five selected pages, with equal design attention to desktop, explicitly showing the fixed hero, tariff-table, click-to-call, and menu solutions described above.
4. **Concept treatments for every new feature** in section 9 (quote estimator, application wizard, click-to-call, office locator, trust module, header search, callback form), shown in situ on the relevant page mockups rather than as isolated, context-free components.
5. **A short rationale note per page** (2–4 sentences) explicitly naming which audit finding(s) each redesigned page resolves — this is what makes the concept defensible to the client as audit-driven, not opinion-driven.

Use existing site content (product names, tariff figures, addresses, legal text, tagline) wherever it is available in the source material described above; clearly mark any illustrative-only placeholder copy (e.g., sample trust statistics) as such.

---

## 14. Quality bar

- Every design decision must map to a named finding from the audit; do not introduce cosmetic changes with no stated problem behind them, and do not touch anything the audit calls out as already working well (the IA, the legal/reference content depth, the existing online-services concept, the login form's structural pattern, the OSAGO CTA pattern).
- The concept must feel like a natural evolution of task.by, not an unrelated new brand — existing users should recognize the structure and the red brand mark immediately.
- Hold every page to the same design-system discipline — no page should introduce a one-off color, spacing value, or component that isn't defined in the system sheet.
- The redesign must read, at a glance, as belonging to the same visual category as 2025–2026 international insurance/finance/enterprise sites — restrained, confident, legible, and trustworthy — not as a generic startup landing page and not as a marketing microsite.
- This is a concept for stakeholder presentation: prioritize a small number of impeccably resolved pages over broad, shallow coverage of the whole site.
- Before finalizing, check every page against this test: would this layout look identical with a different insurer's logo and copy dropped in? If yes, it is too templated — rework it so the composition, hierarchy, and content pairing are visibly specific to ЗАСО «ТАСК» and its actual products, offices, and tariff structures, not a generic enterprise-site skeleton.
