# Convesio developer front — implementation plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static Astro landing page for Convesio developers with an abstract Canvas+GSAP hero, coral/turquoise tokens, dark-by-default theme toggle, single-page sections, and a central link map—matching `docs/superpowers/specs/2026-03-28-convesio-dev-front-design.md`.

**Architecture:** Astro generates a static site (`output: 'static'`). Global layout owns `<html class="dark">` / `light` and CSS variables. `site-links.ts` is the only source of nav/CTA hrefs. Hero atmosphere is isolated in `hero-atmosphere.ts` (Canvas + GSAP); sections import tokens only—no particle logic. GSAP loads for hero/spotlight; lighter motion elsewhere; `prefers-reduced-motion` short-circuits animation init.

**Tech Stack:** Astro 5.x, TypeScript, CSS (global tokens + scoped where needed), GSAP 3 + ScrollTrigger (optional for hero exit / section reveals), Canvas 2D for hero. Fonts via `@fontsource-variable` or `fontsource` (e.g. DM Sans + JetBrains Mono). Vitest for tiny unit tests on config. `@astrojs/check` for Astro diagnostics.

**Spec reference:** `@docs/superpowers/specs/2026-03-28-convesio-dev-front-design.md`

---

## File structure (target)

Create at repository root (alongside existing `docs/`):

| Path | Responsibility |
|------|----------------|
| `package.json` | Scripts: `dev`, `build`, `preview`, `test`, `check` |
| `astro.config.mjs` | Static output, path alias `@/` → `src/` (optional) |
| `tsconfig.json` | Strict TS, Astro types |
| `src/env.d.ts` | Astro reference types |
| `src/layouts/Layout.astro` | `<html lang>`, meta, `ThemeToggle` slot area, global CSS import, skip link |
| `src/pages/index.astro` | Composes header + sections + footer |
| `src/config/site-links.ts` | Exported `siteLinks` object: `nav`, `ctas`, `footer` with `href`, `label`, `external?` |
| `src/styles/global.css` | `:root` / `.dark` / `.light` CSS variables; base typography; focus styles |
| `src/components/nav/SiteHeader.astro` | Sticky nav using `site-links` |
| `src/components/hero/Hero.astro` | Canvas container, scrim, headline, CTAs; imports `hero-atmosphere` via `<script>` |
| `src/components/hero/hero-atmosphere.ts` | Canvas draw loop, particle/line field, GSAP timelines, `matchMedia('(prefers-reduced-motion)')` guard, resize handler |
| `src/components/ui/ThemeToggle.astro` | Button toggles `class` on `document.documentElement`, `localStorage` key e.g. `convesio-dev-theme` |
| `src/components/sections/Pillars.astro` | Three cards: MCP, API, Docs |
| `src/components/sections/Spotlight.astro` | ConvesioPay + Hosting MCP bands |
| `src/components/sections/ChangelogTeaser.astro` | Teaser + link from `site-links` |
| `src/components/sections/ResourcesRoadmap.astro` | Grid of future destinations, `id="resources"` |
| `src/components/footer/SiteFooter.astro` | © Convesio, placeholder legal links |
| `src/scripts/section-reveals.ts` | Optional: GSAP stagger for sections (import from `index` or Layout) |
| `public/favicon.svg` | Minimal placeholder |
| `vitest.config.ts` | Single test run |
| `src/config/site-links.test.ts` | Asserts required keys exist |

---

## Chunk 1: Scaffold and toolchain

### Task 1: Initialize Astro (static) at repo root

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `src/pages/index.astro` (stub), `src/layouts/Layout.astro` (stub)

- [ ] **Step 1:** From `/Users/karmatosed/Repos/devdocs`, run:

```bash
cd /Users/karmatosed/Repos/devdocs
npm create astro@latest . -- --template minimal --typescript strict --install --no-git --yes
```

If the CLI refuses a non-empty directory, run:

```bash
npm create astro@latest convesio-dev-tmp -- --template minimal --typescript strict --install --no-git --yes
```

Then move generated files into the repo root (preserve `docs/`), remove temp folder.

- [ ] **Step 2:** Edit `astro.config.mjs` to set:

```javascript
import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  compressHTML: true,
});
```

- [ ] **Step 3:** Verify dev server starts:

```bash
npm run dev
```

Expected: server runs on `http://localhost:4321` (or similar); no errors.

- [ ] **Step 4:** Verify production build:

```bash
npm run build
```

Expected: `dist/` created, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/
git commit -m "chore: scaffold Astro static site for developer landing"
```

---

## Chunk 2: Dependencies (GSAP, fonts, test, check)

### Task 2: Add runtime and dev dependencies

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1:** Install:

```bash
cd /Users/karmatosed/Repos/devdocs
npm install gsap
npm install -D vitest @astrojs/check typescript
```

- [ ] **Step 2:** Add fonts (pick one pair aligned to spec):

```bash
npm install @fontsource-variable/dm-sans @fontsource-variable/jetbrains-mono
```

- [ ] **Step 3:** Add scripts to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "check": "astro check"
}
```

- [ ] **Step 4:** Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5:** Run:

```bash
npm run check
npm run test
```

Expected: `check` passes (may warn until components exist); `test` passes 0 tests or skip if no tests yet.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add gsap, fonts, vitest, astro check"
```

---

## Chunk 3: Design tokens, global CSS, theme toggle

### Task 3: Tokens and theme

**Files:**
- Create: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`
- Create: `src/components/ui/ThemeToggle.astro`

- [ ] **Step 1:** In `global.css`, define variables for `.dark` (default) and `.light` on `html`:

  - Dark: background `#0f0e0d`–style charcoal (tune for AA), surface cards, `--color-coral`, `--color-turquoise`, text primary/secondary.
  - Light: off-white base, same coral/turquoise roles.
  - `:focus-visible` outline using turquoise.

- [ ] **Step 2:** `Layout.astro`:
  - Default `class="dark"` on `<html>` (or no class + `:root` dark—pick one pattern and document).
  - Import fonts in frontmatter: `@fontsource-variable/dm-sans` and `@fontsource-variable/jetbrains-mono`.
  - Apply `font-family` on `body`.
  - Include `<a href="#main" class="skip-link">Skip to content</a>` styled in `global.css`.
  - Wrap slot in `<main id="main">`.

- [ ] **Step 3:** `ThemeToggle.astro`: on click, toggle `light`/`dark` on `<html>`, persist to `localStorage`. On load, read `localStorage` before paint if possible (inline tiny script in `Layout` head to avoid flash—optional enhancement).

- [ ] **Step 4:** Run `npm run dev`, toggle theme manually; verify contrast of white text on hero area (adjust tokens if needed).

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/layouts/Layout.astro src/components/ui/ThemeToggle.astro
git commit -m "feat: add design tokens, global CSS, and theme toggle"
```

---

## Chunk 4: Site link map + test (TDD)

### Task 4: Central `site-links`

**Files:**
- Create: `src/config/site-links.ts`
- Create: `src/config/site-links.test.ts`

- [ ] **Step 1:** Write failing test `src/config/site-links.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { siteLinks } from './site-links';

describe('siteLinks', () => {
  it('has nav, ctas, and footer keys', () => {
    expect(siteLinks.nav.length).toBeGreaterThan(0);
    expect(siteLinks.ctas.heroPrimary).toBeDefined();
    expect(siteLinks.footer.legal.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2:** Run `npm run test` — Expected: **FAIL** (module missing).

- [ ] **Step 3:** Implement `src/config/site-links.ts` with typed exports:

```typescript
export type NavItem = { label: string; href: string; external?: boolean };

export const siteLinks = {
  nav: [
    { label: 'Docs', href: '#' },
    { label: 'API', href: '#' },
    { label: 'MCP', href: '#' },
    { label: 'Changelog', href: '#' },
  ] as NavItem[],
  ctas: {
    heroPrimary: { label: 'Explore MCP', href: '#spotlight-hosting' },
    heroSecondary: { label: 'Payments & APIs', href: '#spotlight-pay' },
  },
  spotlight: {
    convesioPay: { label: 'ConvesioPay', href: '#' },
    hostingMcp: { label: 'Hosting MCP', href: '#' },
  },
  changelog: { label: 'Full changelog', href: '#' },
  roadmap: [
    { label: 'Documentation', href: '#' },
    { label: 'API reference', href: '#' },
    { label: 'Changelog', href: '#' },
    { label: 'MCP catalog', href: '#' },
  ] as NavItem[],
  footer: {
    legal: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ] as NavItem[],
  },
};
```

Adjust hrefs to use in-page anchors (`#resources`, `#spotlight-pay`, etc.) once section `id`s exist.

- [ ] **Step 4:** Run `npm run test` — Expected: **PASS**.

- [ ] **Step 5: Commit**

```bash
git add src/config/site-links.ts src/config/site-links.test.ts
git commit -m "feat: add central siteLinks config with tests"
```

---

## Chunk 5: Page composition (static sections)

### Task 5: Assemble `index.astro` and section components

**Files:**
- Create: `src/components/nav/SiteHeader.astro`
- Create: `src/components/hero/Hero.astro` (markup only; canvas script in Chunk 6)
- Create: `src/components/sections/Pillars.astro`, `Spotlight.astro`, `ChangelogTeaser.astro`, `ResourcesRoadmap.astro`
- Create: `src/components/footer/SiteFooter.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1:** `SiteHeader.astro`: sticky `header`, logo text "Convesio Developers", map `siteLinks.nav`, include `ThemeToggle`.

- [ ] **Step 2:** `Hero.astro`: full-viewport section with placeholder `canvas`/`div#hero-canvas-host`, scrim gradient overlay, `h1`, subtitle, two anchor buttons from `siteLinks.ctas`. Set `pointer-events: none` on canvas host in CSS; children of hero content `pointer-events: auto`.

- [ ] **Step 3:** `Pillars.astro`: `section` with three article cards (MCP, API, Developer docs).

- [ ] **Step 4:** `Spotlight.astro`: two subsections with `id="spotlight-pay"` and `id="spotlight-hosting"`, distinct border/accent (coral vs turquoise).

- [ ] **Step 5:** `ChangelogTeaser.astro`: 2–3 static sample lines or one “Coming soon” row per spec open decision.

- [ ] **Step 6:** `ResourcesRoadmap.astro`: `section id="resources"` grid of roadmap cards from `siteLinks.roadmap`.

- [ ] **Step 7:** `SiteFooter.astro`: year ©, `siteLinks.footer.legal`.

- [ ] **Step 8:** `index.astro`: use `Layout`, compose components in order per spec §4.

- [ ] **Step 9:** Run `npm run build` — Expected: success.

- [ ] **Step 10: Commit**

```bash
git add src/components src/pages/index.astro
git commit -m "feat: compose landing sections and navigation"
```

---

## Chunk 6: Hero atmosphere — Canvas + GSAP

### Task 6: Abstract data mass + reduced motion

**Files:**
- Create: `src/components/hero/hero-atmosphere.ts`
- Modify: `src/components/hero/Hero.astro`

- [ ] **Step 1:** In `Hero.astro`, add:

```astro
<canvas id="hero-canvas" aria-hidden="true"></canvas>
```

Ensure sibling content sits above (`z-index`); canvas `position: absolute; inset: 0`.

- [ ] **Step 2:** Import script in `Hero.astro`:

```astro
<script>
  import { initHeroAtmosphere } from './hero-atmosphere';
  initHeroAtmosphere();
</script>
```

- [ ] **Step 3:** Implement `hero-atmosphere.ts`:
  - Query `#hero-canvas` and parent size; `devicePixelRatio` scaling for crisp lines.
  - If `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, draw **one static frame** (gradient + sparse blocks) and return.
  - Else: maintain array of abstract elements (short lines + rects); each frame update positions using simple **flow-field** or **rotation toward center** (swirl); **GSAP** `gsap.ticker.add()` or `requestAnimationFrame` with gsap-driven **parameters** (e.g. `gsap.to` on a proxy object `{ angle, pulse }`).
  - Use **turquoise/coral** with low alpha strokes; no readable text.
  - On resize, debounce re-init.

- [ ] **Step 4:** Optional: `ScrollTrigger` to fade canvas opacity past first fold—only if FPS stays solid; otherwise skip (per spec).

- [ ] **Step 5:** Mobile: `matchMedia('(max-width: 768px)')` reduce element count or static frame.

- [ ] **Step 6:** Manual test: Chrome + Safari, toggle reduced motion in OS, resize window.

- [ ] **Step 7: Commit**

```bash
git add src/components/hero/
git commit -m "feat: add abstract Canvas hero atmosphere with GSAP"
```

---

## Chunk 7: Section motion (GSAP hybrid)

### Task 7: Staggered reveals

**Files:**
- Create: `src/scripts/section-reveals.ts`
- Modify: `src/pages/index.astro` or `Layout.astro`

- [ ] **Step 1:** `section-reveals.ts`: query `main section`, set initial `opacity: 0` + `y` via CSS class or inline; `gsap.utils.toArray` + `ScrollTrigger.batch` or per-section `from` with stagger **0.05–0.08s**. Respect `prefers-reduced-motion` (no-op).

- [ ] **Step 2:** Import script on client (same pattern as hero—`<script>` in `index.astro` after content).

- [ ] **Step 3:** Verify scroll in dev; ensure no layout shift breaking CLS (use `transform` only).

- [ ] **Step 4: Commit**

```bash
git add src/scripts/section-reveals.ts src/pages/index.astro
git commit -m "feat: add staggered section reveals with GSAP ScrollTrigger"
```

---

## Chunk 8: Polish, meta, acceptance

### Task 8: SEO, favicon, README, final verification

**Files:**
- Modify: `src/layouts/Layout.astro`
- Create: `public/favicon.svg`
- Modify: `README.md`

- [ ] **Step 1:** Add `<title>`, `<meta name="description">`, Open Graph basics in `Layout.astro`.

- [ ] **Step 2:** Add minimal `favicon.svg` (coral/turquoise abstract mark).

- [ ] **Step 3:** Update root `README.md` with: purpose, `npm install`, `npm run dev`, `npm run build`, link to design spec path.

- [ ] **Step 4:** Run full suite:

```bash
npm run check
npm run test
npm run build
```

Expected: all pass.

- [ ] **Step 5:** Manual acceptance per design spec §8 (themes, motion, keyboard focus, no console errors).

- [ ] **Step 6: Commit**

```bash
git add README.md public/favicon.svg src/layouts/Layout.astro
git commit -m "docs: README, meta, favicon; polish for launch"
```

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-28-convesio-dev-front.md`. Ready to execute?

**Suggested execution:** Implement chunks **1 → 8** in order; commit after each task as written. If `npm create astro@latest .` fails on non-empty directory, use the temp-dir move workaround in Chunk 1.

**Skills:** `@docs/superpowers/specs/2026-03-28-convesio-dev-front-design.md`, `@superpowers/executing-plans` or `@superpowers/subagent-driven-development`
