// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Adresse publique du site (sitemap, liens absolus). À remplacer par ton domaine quand tu l'auras.
	site: 'https://alcoz.github.io',
	// Polices téléchargées au build et servies par le site (pas d'appel à Google au chargement).
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Newsreader',
			cssVariable: '--font-serif',
			weights: [400, 500, 600, 700],
			styles: ['normal', 'italic'],
			fallbacks: ['Iowan Old Style', 'Charter', 'Georgia', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			weights: [400, 500],
			styles: ['normal'],
			fallbacks: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
		},
	],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
