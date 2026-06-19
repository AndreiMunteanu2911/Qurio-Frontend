import tailwindcss from '@tailwindcss/vite';
import vercelAdapter from '@sveltejs/adapter-vercel';
import staticAdapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';
const isVercelBuild = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: isVercelBuild && !isCapacitorBuild
				? vercelAdapter()
				: staticAdapter({
					pages: 'build',
					assets: 'build',
					fallback: 'index.html',
					precompress: false,
					strict: false
				})
		})
	]
});
