# devdocs

Static developer hub for **Convesio** — hosting, MCPs, APIs, and payments.

## Design

- Spec: [`docs/superpowers/specs/2026-03-28-convesio-dev-front-design.md`](docs/superpowers/specs/2026-03-28-convesio-dev-front-design.md)
- Implementation plan: [`docs/superpowers/plans/2026-03-28-convesio-dev-front.md`](docs/superpowers/plans/2026-03-28-convesio-dev-front.md)

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # static output to dist/
npm run preview  # serve dist/
npm run test     # vitest (site links config)
npm run check    # astro check
```

## Stack

- [Astro](https://astro.build/) (static)
- [GSAP](https://greensock.com/gsap/) + ScrollTrigger (motion)
- TypeScript, Vitest

Central navigation and CTA targets live in `src/config/site-links.ts`.
