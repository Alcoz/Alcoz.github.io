import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			summary: z.string(),
			date: z.coerce.date(),
			tags: z.array(z.string()).default([]),
			repo: z.url().optional(),
			demo: z.url().optional(),
			// Image de la carte, chemin relatif au fichier .md (ex. './images/mon-projet.png').
			cover: image().optional(),
			coverAlt: z.string().optional(),
		}),
});

const articles = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

export const collections = { projects, articles };
