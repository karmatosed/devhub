import gsap from 'gsap';

function cssColorToRgb(value: string): [number, number, number] {
	const v = value.trim();
	if (!v) return [224, 122, 95];
	if (v.startsWith('#')) {
		const hex = v.slice(1);
		const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
		const n = parseInt(full, 16);
		if (Number.isNaN(n)) return [224, 122, 95];
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}
	const rgb = v.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
	if (rgb) {
		return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
	}
	return [224, 122, 95];
}

function rgba(rgb: [number, number, number], a: number): string {
	const x = Math.min(1, Math.max(0, a));
	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${x})`;
}

/** Slightly higher alphas on bright canvas so motion reads like dark mode */
function themeAlpha(light: boolean, base: number): number {
	if (!light) return base;
	if (base <= 0.04) return Math.min(1, base * 2);
	if (base <= 0.07) return Math.min(1, base * 1.65);
	if (base <= 0.12) return Math.min(1, base * 1.4);
	return Math.min(1, base * 1.22);
}

type Particle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	angle: number;
	len: number;
	/** coral = payment / settlement motion; turquoise = hosting / infra */
	palette: 0 | 1;
};

type StreamSeg = {
	y: number;
	x: number;
	len: number;
	speed: number;
};

type RailPulse = {
	railIndex: number;
	x: number;
	speed: number;
	segLen: number;
};

function createParticles(count: number, width: number, height: number): Particle[] {
	const list: Particle[] = [];
	for (let i = 0; i < count; i++) {
		const palette: 0 | 1 = i % 2 === 0 ? 0 : 1;
		list.push({
			x: Math.random() * width,
			y: Math.random() * height,
			vx: (Math.random() - 0.5) * 0.65,
			vy: (Math.random() - 0.5) * 0.65,
			angle: Math.random() * Math.PI * 2,
			len: 10 + Math.random() * 40,
			palette,
		});
	}
	return list;
}

function createStreams(count: number, width: number, height: number, railYs: number[]): StreamSeg[] {
	const list: StreamSeg[] = [];
	for (let i = 0; i < count; i++) {
		const rail = railYs[Math.floor(Math.random() * Math.max(1, railYs.length))] ?? height * 0.5;
		list.push({
			y: rail + (Math.random() - 0.5) * 14,
			x: Math.random() * width,
			len: 14 + Math.random() * 44,
			speed: 0.45 + Math.random() * 1.25,
		});
	}
	return list;
}

function createRailPulses(count: number, width: number, railYs: number[]): RailPulse[] {
	const list: RailPulse[] = [];
	for (let i = 0; i < count; i++) {
		const railIndex = i % Math.max(1, railYs.length);
		list.push({
			railIndex,
			x: (width / Math.max(4, count)) * i + Math.random() * 40,
			speed: 0.8 + Math.random() * 1.4,
			segLen: 5 + Math.random() * 10,
		});
	}
	return list;
}

export function initHeroAtmosphere(): void {
	const el = document.getElementById('hero-canvas');
	if (!(el instanceof HTMLCanvasElement)) return;
	const canvas = el;

	const ctxRaw = canvas.getContext('2d');
	if (!ctxRaw) return;
	const ctx: CanvasRenderingContext2D = ctxRaw;

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const mobile = window.matchMedia('(max-width: 768px)').matches;

	let width = 0;
	let height = 0;
	let dpr = 1;
	let particles: Particle[] = [];
	let streams: StreamSeg[] = [];
	let railPulses: RailPulse[] = [];
	let railYs: number[] = [];
	let cellSize = 26;

	/** Swirl focal point — lerps toward pointer while over hero */
	let swirlCx = 0;
	let swirlCy = 0;
	let pointerInsideHero = false;
	let pointerX = 0;
	let pointerY = 0;

	const POINTER_FOLLOW = 0.085;

	let coralRgb: [number, number, number] = [224, 122, 95];
	let turquoiseRgb: [number, number, number] = [46, 196, 182];
	let canvasBg = '#121110';
	let isLightTheme = false;

	function refreshThemeColors(): void {
		const root = document.documentElement;
		const cs = getComputedStyle(root);
		isLightTheme = root.classList.contains('light');
		coralRgb = cssColorToRgb(cs.getPropertyValue('--color-coral').trim());
		turquoiseRgb = cssColorToRgb(cs.getPropertyValue('--color-turquoise').trim());
		const bg = cs.getPropertyValue('--color-bg').trim();
		canvasBg = bg || (isLightTheme ? '#f1f5f9' : '#121110');
	}

	function computeRails() {
		railYs = [
			height * 0.22,
			height * 0.38,
			height * 0.55,
			height * 0.72,
			height * 0.86,
		];
		if (mobile) {
			railYs = [height * 0.28, height * 0.52, height * 0.76];
		}
	}

	function layoutField() {
		cellSize = mobile ? 28 : 20;
	}

	function resize() {
		const parent = canvas.parentElement;
		if (!parent) return;
		width = parent.clientWidth;
		height = parent.clientHeight;
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		computeRails();

		const pCount = reduced ? 52 : mobile ? 115 : 260;
		const streamCount = reduced ? 0 : mobile ? 16 : 38;
		const pulseCount = reduced ? 0 : mobile ? 5 : 12;
		particles = createParticles(pCount, width, height);
		streams = createStreams(streamCount, width, height, railYs);
		railPulses = createRailPulses(pulseCount, width, railYs);
		layoutField();
		refreshThemeColors();

		const dcx = width * 0.48;
		const dcy = height * 0.36;
		swirlCx = dcx;
		swirlCy = dcy;
		pointerX = dcx;
		pointerY = dcy;
	}

	/** Hosting: tiers + columns (infra). Payments: settlement rails (coral). */
	function drawDataGrid(t: number, driftScale: number, mouseBiasX: number, mouseBiasY: number) {
		const driftX =
			Math.sin(t * 0.00012 * driftScale) * 14 +
			(t * 0.018 * driftScale) % cellSize +
			mouseBiasX * 0.35;
		const driftY =
			Math.cos(t * 0.00009 * driftScale) * 11 +
			(t * 0.014 * driftScale) % cellSize +
			mouseBiasY * 0.35;

		/* Hosting: horizontal “rack” tiers (slightly stronger) */
		ctx.lineWidth = isLightTheme ? 1.05 : 1;
		ctx.strokeStyle = rgba(turquoiseRgb, themeAlpha(isLightTheme, 0.085));
		for (let y = -cellSize; y < height + cellSize * 2; y += cellSize) {
			const py = y + driftY;
			ctx.beginPath();
			ctx.moveTo(0, py);
			ctx.lineTo(width, py);
			ctx.stroke();
		}

		ctx.strokeStyle = rgba(turquoiseRgb, themeAlpha(isLightTheme, 0.055));
		for (let x = -cellSize; x < width + cellSize * 2; x += cellSize) {
			const px = x + driftX;
			ctx.beginPath();
			ctx.moveTo(px, 0);
			ctx.lineTo(px, height);
			ctx.stroke();
		}

		/* Payment: faint settlement rails (horizontal, coral) */
		for (const ry of railYs) {
			ctx.strokeStyle = rgba(coralRgb, themeAlpha(isLightTheme, 0.09));
			ctx.beginPath();
			ctx.moveTo(0, ry);
			ctx.lineTo(width, ry);
			ctx.stroke();
		}

		/* Light diagonal de-emphasized */
		ctx.strokeStyle = rgba(turquoiseRgb, themeAlpha(isLightTheme, 0.035));
		const diagOff = (t * 0.008 * driftScale) % 80;
		for (let d = -height; d < width + height; d += 56) {
			ctx.beginPath();
			ctx.moveTo(d + diagOff, 0);
			ctx.lineTo(d + diagOff + height, height);
			ctx.stroke();
		}
	}

	function drawStreams(globalTime: number, driftScale: number) {
		const t = globalTime * 0.001 * driftScale;
		for (const s of streams) {
			s.x += s.speed * driftScale;
			if (s.x > width + s.len) s.x = -s.len;
			if (s.x < -s.len) s.x = width + s.len;

			const y = s.y + Math.sin(t + s.y * 0.01) * 4;
			ctx.strokeStyle = rgba(coralRgb, themeAlpha(isLightTheme, 0.26));
			ctx.lineWidth = isLightTheme ? 1.15 : 1;
			ctx.setLineDash([4, 3, 2, 4]);
			ctx.beginPath();
			ctx.moveTo(s.x, y);
			ctx.lineTo(s.x + s.len, y);
			ctx.stroke();
			ctx.setLineDash([]);
		}
	}

	function drawRailPulses(globalTime: number, driftScale: number) {
		for (const p of railPulses) {
			const ry = railYs[p.railIndex];
			if (ry === undefined) continue;
			p.x += p.speed * driftScale;
			if (p.x > width + 20) p.x = -20;

			const glow = 0.35 + 0.25 * Math.sin(globalTime * 0.003 + p.railIndex);
			const half = p.segLen * 0.5;
			ctx.strokeStyle = rgba(coralRgb, themeAlpha(isLightTheme, glow));
			ctx.lineWidth = isLightTheme ? 1.15 : 1;
			ctx.beginPath();
			ctx.moveTo(p.x - half, ry);
			ctx.lineTo(p.x + half, ry);
			ctx.stroke();
		}
	}

	function drawStaticFrame() {
		refreshThemeColors();
		ctx.fillStyle = canvasBg;
		ctx.fillRect(0, 0, width, height);
		drawDataGrid(0, 0, 0, 0);
		for (let i = 0; i < particles.length; i++) {
			const p = particles[i];
			const stroke = p.palette
				? rgba(turquoiseRgb, themeAlpha(isLightTheme, 0.22))
				: rgba(coralRgb, themeAlpha(isLightTheme, 0.2));
			ctx.strokeStyle = stroke;
			ctx.lineWidth = isLightTheme ? 1.08 : 1;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(
				p.x + Math.cos(p.angle) * p.len * 0.55,
				p.y + Math.sin(p.angle) * p.len * 0.55,
			);
			ctx.stroke();
		}
	}

	const swirl = { strength: reduced ? 0 : mobile ? 0.85 : 1.35 };

	function step(globalTime: number) {
		ctx.fillStyle = canvasBg;
		ctx.fillRect(0, 0, width, height);

		const driftScale = swirl.strength;

		const defaultCx = width * 0.48;
		const defaultCy = height * 0.36;
		const targetCx = pointerInsideHero ? pointerX : defaultCx;
		const targetCy = pointerInsideHero ? pointerY : defaultCy;
		swirlCx += (targetCx - swirlCx) * POINTER_FOLLOW;
		swirlCy += (targetCy - swirlCy) * POINTER_FOLLOW;

		const mouseBiasX = pointerInsideHero ? (pointerX - defaultCx) * 0.06 : 0;
		const mouseBiasY = pointerInsideHero ? (pointerY - defaultCy) * 0.06 : 0;

		drawDataGrid(globalTime, driftScale, mouseBiasX, mouseBiasY);
		drawStreams(globalTime, driftScale);
		drawRailPulses(globalTime, driftScale);

		const cx = swirlCx;
		const cy = swirlCy;
		const t = globalTime * 0.00022 * swirl.strength;

		for (const p of particles) {
			const dx = p.x - cx;
			const dy = p.y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy) + 100;
			const swirlX = (-dy / dist) * 1.65 * swirl.strength;
			const swirlY = (dx / dist) * 1.65 * swirl.strength;

			/* Payment: bias horizontal drift (rails). Hosting: bias vertical structure. */
			const payBias = p.palette === 0 ? 0.012 : 0;
			const hostBias = p.palette === 1 ? 0.008 : 0;

			p.vx =
				p.vx * 0.982 +
				swirlX * 0.018 +
				Math.sin(t * 1.4 + p.angle) * 0.0045 +
				payBias;
			p.vy =
				p.vy * 0.982 +
				swirlY * 0.018 +
				Math.cos(t * 1.1 + p.angle) * 0.0045 -
				hostBias * Math.sin(p.y * 0.01);
			p.x += p.vx;
			p.y += p.vy;
			if (p.palette === 0) {
				p.angle *= 0.995;
				p.angle += Math.sin(t * 2.1 + p.x * 0.02) * 0.001;
			} else {
				p.angle += 0.0034 * swirl.strength;
			}

			if (p.x < -40) p.x = width + 40;
			if (p.x > width + 40) p.x = -40;
			if (p.y < -40) p.y = height + 40;
			if (p.y > height + 40) p.y = -40;

			const pulse =
				0.14 +
				0.32 *
					(0.5 + 0.5 * Math.sin(t * 2.2 + p.angle)) *
					(0.5 + 0.5 * Math.sin(t * 0.8 + p.x * 0.01));
			const stroke = p.palette
				? rgba(
						turquoiseRgb,
						themeAlpha(isLightTheme, pulse + 0.08 + 0.12 * Math.sin(t + p.angle)),
					)
				: rgba(
						coralRgb,
						themeAlpha(isLightTheme, pulse + 0.06 + 0.12 * Math.cos(t * 0.85 + p.angle)),
					);
			ctx.strokeStyle = stroke;
			ctx.lineWidth = isLightTheme ? 1.12 : 1;
			const seg =
				p.len * (0.78 + 0.22 * Math.sin(t * 2.4 + p.angle)) * (p.palette === 0 ? 0.95 : 1);
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(p.x + Math.cos(p.angle) * seg, p.y + Math.sin(p.angle) * seg);
			ctx.stroke();
		}

		ctx.strokeStyle = rgba(
			turquoiseRgb,
			themeAlpha(isLightTheme, 0.06 + 0.1 * Math.sin(t * 3)),
		);
		for (let i = 0; i < 14; i++) {
			const px = width * (0.06 + i * 0.065) + Math.sin(t * 1.2 + i) * 30;
			const py = height * (0.12 + (i % 4) * 0.08) + Math.cos(t * 0.9 + i * 0.5) * 22;
			ctx.beginPath();
			ctx.moveTo(px, py);
			ctx.lineTo(px + 22 + i * 2, py - 12 - (i % 3) * 4);
			ctx.stroke();
		}

		ctx.strokeStyle = rgba(turquoiseRgb, themeAlpha(isLightTheme, 0.06));
		ctx.lineWidth = isLightTheme ? 1.05 : 1;
		for (let i = 0; i < particles.length; i += mobile ? 5 : 3) {
			const a = particles[i];
			const b = particles[(i + 17) % particles.length];
			const ddx = a.x - b.x;
			const ddy = a.y - b.y;
			if (ddx * ddx + ddy * ddy < (mobile ? 12000 : 18000)) {
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
		}
	}

	const started = performance.now();

	function render() {
		step(performance.now() - started);
	}

	resize();
	window.addEventListener('resize', resize);

	const themeObserver = new MutationObserver(() => {
		refreshThemeColors();
	});
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class'],
	});

	function updatePointerFromClient(clientX: number, clientY: number) {
		const rect = canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;
		if (x < 0 || x > width || y < 0 || y > height) {
			pointerInsideHero = false;
			return;
		}
		pointerX = x;
		pointerY = y;
		pointerInsideHero = true;
	}

	function onHeroPointerMove(e: Event) {
		if (!(e instanceof PointerEvent)) return;
		updatePointerFromClient(e.clientX, e.clientY);
	}

	function onHeroPointerLeave() {
		pointerInsideHero = false;
	}

	const hero = canvas.closest('.hero');
	if (hero) {
		hero.addEventListener('pointermove', onHeroPointerMove);
		hero.addEventListener('pointerleave', onHeroPointerLeave);
	}

	if (reduced) {
		drawStaticFrame();
		return;
	}

	gsap.ticker.add(render);

	const onVisibility = () => {
		if (document.hidden) {
			gsap.ticker.remove(render);
		} else {
			gsap.ticker.add(render);
		}
	};
	document.addEventListener('visibilitychange', onVisibility);
}
