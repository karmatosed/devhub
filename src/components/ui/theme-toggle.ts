const STORAGE_KEY = 'convesio-dev-theme';

function apply(next: 'light' | 'dark'): void {
	const root = document.documentElement;
	root.classList.remove('dark', 'light');
	root.classList.add(next);
	const glyph = document.getElementById('theme-toggle-label');
	if (glyph) glyph.textContent = next === 'dark' ? '☾' : '☀';
	const btn = document.getElementById('theme-toggle');
	btn?.setAttribute(
		'aria-label',
		next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
	);
}

export function initThemeToggle(): void {
	const btn = document.getElementById('theme-toggle');
	btn?.addEventListener('click', () => {
		const root = document.documentElement;
		const next: 'light' | 'dark' = root.classList.contains('dark') ? 'light' : 'dark';
		localStorage.setItem(STORAGE_KEY, next);
		apply(next);
	});

	const glyph = document.getElementById('theme-toggle-label');
	if (glyph && document.documentElement.classList.contains('light')) {
		glyph.textContent = '☀';
	}
}
