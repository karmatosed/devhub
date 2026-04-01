import { describe, it, expect } from 'vitest';
import { siteLinks } from './site-links';

describe('siteLinks', () => {
	it('has nav, ctas, and footer keys', () => {
		expect(siteLinks.nav.length).toBeGreaterThan(0);
		expect(siteLinks.ctas.heroPrimary).toBeDefined();
		expect(siteLinks.footer.legal.length).toBeGreaterThan(0);
	});
});
