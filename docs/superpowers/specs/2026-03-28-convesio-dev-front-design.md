# Convesio developer front — static landing (design spec)

**Date:** 2026-03-28  
**Status:** Draft → ready for implementation planning  
**Repository:** `devdocs` (greenfield)

## 1. Purpose

Ship a **single-page, static developer-facing front** for Convesio that:

- Feels **credible and premium** for developers evaluating **hosting**, **MCPs**, **APIs**, and **payments** (ConvesioPay).
- Establishes a **distinct visual identity** using **coral and turquoise** on **dark-by-default** surfaces, **avoiding navy** and cold blue-grays that read as generic “corporate blue.”
- Delivers a **memorable first impression** comparable in ambition to flagship dev marketing sites (e.g. [WordPress.com Developer Resources](https://developer.wordpress.com/)), with a **signature animated header** and **high-class motion** (GSAP).
- Uses **placeholders and a central link map** so real docs, APIs, changelogs, and external resources can be **wired in later without restructuring the page**.

## 2. Goals and non-goals

### Goals (v1)

- One **scrollable landing** with clear hierarchy: **nav → hero → pillars → spotlight (ConvesioPay + Hosting MCP) → changelog teaser → resources / roadmap → footer**.
- **Dark mode default** with a **light mode** toggle; both modes preserve **coral (primary actions) and turquoise (secondary emphasis, links, focus)** roles.
- **Sticky top navigation** with items that **name the future IA** (Docs, API, MCP, Changelog) and can point to **placeholders** until destinations exist.
- **Abstract “data mass” hero atmosphere** (see §5): **lines + blocks**, minimal readable glyphs — **luxury / minimal**, not literal binary wallpaper.
- **GSAP-led animation** with a **hybrid loading strategy**: premium timelines on **hero and key spotlight sections**; lighter motion elsewhere; full respect for **`prefers-reduced-motion`**.
- **Central configuration** for outbound and future routes (single place to update hrefs).

### Non-goals (v1)

- Full documentation site, search, versioned API reference, or authenticated areas.
- CMS integration; content is **static** in-repo for this phase.
- Committing to final URLs for every CTA — placeholders are **explicitly allowed**.

## 3. Audience and success criteria

### Audience

- **Developers and technical decision-makers** evaluating Convesio tooling (MCP, API, hosting, payments).

### Success criteria

- **First load**: header animation and typography feel **intentional and premium**, not noisy or template-like.
- **Clarity**: within one scroll, a visitor understands **what buckets exist** (MCP, API, docs, changelog, ConvesioPay, Hosting MCP) and **where to go next** (even if some links are placeholders).
- **Trust**: motion and visuals reinforce **infrastructure + payments** without gimmicks; **accessibility** and **performance** are not sacrificed for effects.

## 4. Information architecture

### v1 (single page)

| Section            | Role |
|--------------------|------|
| Header / hero      | Wow + positioning + primary CTAs |
| Product pillars    | MCPs, API, Developer docs (cards + buttons) |
| Spotlight          | **ConvesioPay** and **Hosting MCP** (distinct visual treatment) |
| Changelog          | Teaser strip; link placeholder for full changelog |
| Resources / roadmap | Named destinations (Docs, API, Changelog, MCP catalog) with placeholder CTAs |
| Footer             | Legal placeholders, ©, optional secondary links |

### Suggested future routes (not v1)

Reserve names for later split-out pages: `/docs`, `/api` or `/reference`, `/changelog`, `/mcp`, `/mcp/hosting`, `/payments` or `/convesiopay`, optional `/guides`. v1 **may expose these as labels** in nav and roadmap; **hrefs** remain placeholders until implemented.

### Placeholder strategy

- Maintain a **single module** (e.g. `siteLinks` or `links.ts`) exporting **nav hrefs**, **CTA hrefs**, and **optional “external” flags**. No scattered `#` strings across components.
- **Default**: `href="#"` or in-page anchors (e.g. `#resources`) where scrolling replaces navigation.
- **Optional**: visible “Coming soon” only for **secondary** items if product wants transparency; not required for v1 if placeholders are documented for owners.

## 5. Visual and motion design

### 5.1 Color and surfaces

- **Dark default**: near-black / deep charcoal base — **not** pure `#000` everywhere; use **warm neutrals** for elevated surfaces.
- **Coral**: primary buttons, key highlights, sparing gradient accents on hero or dividers.
- **Turquoise**: links, secondary emphasis, MCP/API badges, focus rings, **thin** border glows on cards.
- **Avoid**: navy and dominant cold blue-grays; if blue appears, it must be **subordinate** and tied to turquoise, not a new brand axis.
- **Light mode**: soft off-white base; **same semantic roles** for coral and turquoise.

### 5.2 Typography

- **Sans**: clean, technical (e.g. Geist, IBM Plex Sans, or DM Sans — final choice at implementation).
- **Monospace**: labels, MCP names, code-like snippets in cards — **developer signal**, not body text.

### 5.3 Header / hero: abstract data mass (option **C**)

**Art direction:** **Abstract** — **tiny lines, blocks, and occasional connection ticks** suggesting **network / rails / flow**. **Almost no readable characters** (no literal `010101` fields). This keeps the aesthetic **luxury / minimal** and avoids “Matrix cliché.”

**Layers:**

1. **Atmosphere**: soft coral → turquoise radial wash (low saturation).
2. **Swirling mass**: **high-count micro-elements** (lines/blocks) in **slow curved motion** (vortex / flow-field feel) with **occasional pulses** — suggest **activity** without literal payment data.
3. **Foreground**: headline, subcopy, nav, CTAs on a **legibility scrim** (gradient or frosted strip) so text stays readable at all times.

**Implementation direction:**

- **Canvas 2D** (recommended) for density and GPU-friendly drawing; **GSAP** drives **parameters** (swirl strength, opacity envelope, pulse timing), not per-frame spaghetti in React state.
- **Alternative** if scope demands: simplified SVG + GSAP — acceptable if particle count stays low.

**Scroll (optional enhancement):** GSAP **ScrollTrigger** may **slow or dissolve** the mass past the first fold — **only if** it does not harm performance or accessibility; otherwise static past hero.

### 5.4 GSAP usage (hybrid, high class)

- **Hero + spotlight bands**: **timelines** with **custom easing** (small set of brand curves), **staggered** reveals (predictable delays, e.g. 40–80ms steps).
- **Elsewhere**: lighter fade/slide or CSS where sufficient.
- **Micro-interactions**: hover/focus on buttons and cards — **transform / opacity**; avoid layout-thrashing properties.
- **`prefers-reduced-motion: reduce`**: disable or replace with **static** composition + at most **one** subtle non-motion cue (e.g. opacity).

### 5.5 Mobile and performance

- Reduce particle density, simplify paths, or use **static hero** with **one** accent animation on small viewports.
- Load GSAP (and any Canvas-heavy code) in a way that **does not block** first paint of text and nav (e.g. defer / idle / `requestAnimationFrame` discipline — detail in implementation plan).

## 6. Architecture (logical units)

| Unit | Responsibility | Depends on |
|------|----------------|------------|
| **Layout shell** | HTML document, meta, global styles, theme toggle | — |
| **Theme** | Dark/light class on root, CSS variables | Layout shell |
| **Link map** | Single source of hrefs and labels | — |
| **Header / hero** | Nav, hero copy, CTA row, **Canvas + GSAP** atmosphere | Link map, theme |
| **Sections** | Pillars, spotlight, changelog teaser, roadmap | Link map, motion (lighter) |
| **Footer** | Legal placeholders, © | Link map |

Boundaries: **visual effects** stay inside **header/hero module**; **sections** consume **tokens and link map** only — no particle logic in content components.

## 7. Accessibility

- **Contrast**: text on hero must meet **WCAG AA** against the scrim + background (verify with chosen palette).
- **Motion**: honor **`prefers-reduced-motion`**; provide equivalent **static** experience.
- **Keyboard**: focus states use **turquoise** (or design-token equivalent); no keyboard traps in canvas overlay (canvas must not intercept focus — pointer-events none where appropriate).
- **Semantics**: landmarks (`header`, `main`, `footer`), heading order, buttons vs links used consistently.

## 8. Testing and acceptance (v1)

- **Visual**: dark default + light toggle; coral/turquoise roles visible; hero “wow” present on desktop; reduced-motion path verified.
- **Functional**: all nav and CTA targets resolve (placeholders acceptable); no console errors on load.
- **Performance**: no severe jank on mid-range laptop; mobile receives a **degraded but premium** variant.
- **Cross-browser**: latest Chrome, Safari, Firefox (smoke).

## 9. Open decisions (implementation phase)

These are **not** blockers for this design doc; they belong in the implementation plan:

- Exact font files and npm packages for Astro.
- Whether changelog teaser uses **static sample entries** or a single “Coming soon” card.
- Exact GSAP plugins (e.g. ScrollTrigger) and bundle split strategy.
- Hosting target (e.g. static host, CDN) — **out of scope** for visual design.

## 10. References (inspiration, not copy)

- [WordPress.com Developer Resources](https://developer.wordpress.com/) — flagship dev marketing ambition.
- [Vercel](https://vercel.com/home) — technical polish and motion benchmarks.
- [GitBook](https://www.gitbook.com/) — docs-adjacent clarity (for future phases).
- [Convesio](https://convesio.com/) — brand context; **this site pushes palette toward coral/turquoise** as specified, not legacy navy-forward art.

---

## Next step

Stakeholder review of this document, then a detailed **implementation plan** (scaffold, dependencies, file layout, and build/deploy steps).
