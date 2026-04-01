import gsap from 'gsap';

export function initHeroIntro(): void {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const eyebrow = document.querySelector('.hero__eyebrow');
	const title = document.querySelector('.hero__title');
	const sub = document.querySelector('.hero__sub');
	const ctas = document.querySelector('.hero__ctas');
	const panel = document.querySelector('.hero__panel');

	const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
	if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 14, duration: 0.5 }, 0);
	if (title) tl.from(title, { opacity: 0, y: 28, duration: 0.75 }, 0.08);
	if (sub) tl.from(sub, { opacity: 0, y: 20, duration: 0.65 }, 0.18);
	if (ctas) tl.from(ctas.children, { opacity: 0, y: 16, duration: 0.55, stagger: 0.07 }, 0.32);
	if (panel) {
		tl.from(
			panel,
			{ opacity: 0, y: 26, scale: 0.98, duration: 0.75 },
			window.matchMedia('(min-width: 960px)').matches ? 0.22 : 0.38,
		);
	}
}
