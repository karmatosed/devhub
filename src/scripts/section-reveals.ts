import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSectionReveals(): void {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
	if (!nodes.length) return;

	gsap.utils.toArray(nodes).forEach((el, i) => {
		const element = el as HTMLElement;
		gsap.fromTo(
			element,
			{ opacity: 0, y: 36 },
			{
				opacity: 1,
				y: 0,
				duration: 0.75,
				ease: 'power3.out',
				delay: Math.min(i * 0.04, 0.24),
				scrollTrigger: {
					trigger: element,
					start: 'top 88%',
					toggleActions: 'play none none none',
				},
			},
		);
	});
}
