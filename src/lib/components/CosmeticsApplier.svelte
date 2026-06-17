<script lang="ts">
	import { onMount } from 'svelte';
	import { getInventory } from '$lib/api';

	let activeCosmetics = $state<Record<string, string>>({});

	const ACCENT_COLORS: Record<string, { accent: string; accentSoft: string }> = {
		accent_gold: { accent: '#ffc800', accentSoft: 'rgb(255 200 0 / 0.1)' },
		accent_rose: { accent: '#ff6b9d', accentSoft: 'rgb(255 107 157 / 0.1)' },
		accent_emerald: { accent: '#34d399', accentSoft: 'rgb(52 211 153 / 0.1)' },
		accent_sapphire: { accent: '#60a5fa', accentSoft: 'rgb(96 165 250 / 0.1)' },
		accent_amber: { accent: '#fbbf24', accentSoft: 'rgb(251 191 36 / 0.1)' },
	};

	const THEME_BGS: Record<string, string> = {
		theme_midnight: '#0c1445',
		theme_sunset: '#2d1b2e',
		theme_forest: '#0a1f14',
		theme_ocean: '#0a1f2e',
		theme_galaxy: '#0e0820',
	};

	const SKIN_CLASSES: Record<string, string> = {
		skin_minimal: 'card-skin-minimal',
		skin_gradient: 'card-skin-gradient',
		skin_neon: 'card-skin-neon',
		skin_glass: 'card-skin-glass',
		skin_classic: 'card-skin-classic',
	};

	onMount(async () => {
		try {
			const inv = await getInventory();
			activeCosmetics = inv.activeCosmetics ?? {};
		} catch { /* ok */ }

		applyCosmetics();
	});

	function applyCosmetics() {
		const root = document.documentElement;
		root.removeAttribute('data-exam-theme');
		root.classList.remove(...Object.values(SKIN_CLASSES));

		// Accent color
		const accentId = activeCosmetics['accent'];
		if (accentId && ACCENT_COLORS[accentId]) {
			const { accent, accentSoft } = ACCENT_COLORS[accentId];
			root.style.setProperty('--accent', accent);
			root.style.setProperty('--accent-soft', accentSoft);
		} else {
			root.style.setProperty('--accent', '#69eff7');
			root.style.setProperty('--accent-soft', 'rgb(105 239 247 / 0.1)');
		}

		// Exam theme
		const themeId = activeCosmetics['examTheme'];
		if (themeId && THEME_BGS[themeId]) {
			root.dataset.examTheme = themeId;
		}

		// Card skin
		const skinId = activeCosmetics['cardSkin'];
		if (skinId && SKIN_CLASSES[skinId]) {
			root.classList.add(SKIN_CLASSES[skinId]);
		}
	}

	$effect(() => {
		if (typeof document !== 'undefined') applyCosmetics();
	});
</script>
