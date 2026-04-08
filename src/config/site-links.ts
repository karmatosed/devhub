export type NavItem = { label: string; href: string; external?: boolean };

export const siteLinks = {
	nav: [
		{ label: 'APIs', href: '#featured-apis' },
		{ label: 'Changelog', href: '#changelog' },
	] as NavItem[],
	ctas: {
		heroPrimary: { label: 'Explore APIs', href: '#featured-apis' },
		heroSecondary: { label: 'Changelog', href: '#changelog' },
	},
	spotlight: {
		convesioPay: {
			label: 'Documentation',
			href: 'https://docs.convesiopay.com/',
			external: true,
		},
		convert: {
			label: 'Documentation',
			href: 'https://developers.convert.convesio.com/',
			external: true,
		},
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
			{
				label: 'Privacy',
				href: 'https://convesio.com/privacy-policy/',
				external: true,
			},
			{
				label: 'Terms',
				href: 'https://convesio.com/terms-of-service/',
				external: true,
			},
		] as NavItem[],
	},
};
