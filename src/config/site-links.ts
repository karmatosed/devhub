export type NavItem = { label: string; href: string; external?: boolean };

export const siteLinks = {
	nav: [
		{ label: 'Docs', href: '#resources' },
		{ label: 'API', href: '#resources' },
		{ label: 'MCP', href: '#spotlight-hosting' },
		{ label: 'Changelog', href: '#changelog' },
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
