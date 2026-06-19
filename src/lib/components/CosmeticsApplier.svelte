<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getInventory } from '$lib/api';
	import { badgeRefresh } from '$lib/refresh';

	let activeCosmetics = $state<Record<string, string>>({});

	const ACCENT_COLORS: Record<string, { accent: string; accentSoft: string }> = {
		accent_gold: { accent: '#ffd23f', accentSoft: 'rgb(255 210 63 / 0.18)' },
		accent_rose: { accent: '#ff3f8e', accentSoft: 'rgb(255 63 142 / 0.18)' },
		accent_emerald: { accent: '#12e08a', accentSoft: 'rgb(18 224 138 / 0.18)' },
		accent_sapphire: { accent: '#2f80ff', accentSoft: 'rgb(47 128 255 / 0.18)' },
		accent_amber: { accent: '#ff8a00', accentSoft: 'rgb(255 138 0 / 0.18)' },
		accent_crimson: { accent: '#ff3045', accentSoft: 'rgb(255 48 69 / 0.2)' },
		accent_lime: { accent: '#b6ff2e', accentSoft: 'rgb(182 255 46 / 0.18)' },
		accent_orchid: { accent: '#d946ef', accentSoft: 'rgb(217 70 239 / 0.2)' },
		accent_ice: { accent: '#7dd3fc', accentSoft: 'rgb(125 211 252 / 0.2)' },
	};

	const THEME_BGS: Record<string, string> = {
		theme_midnight: 'radial-gradient(circle at top, #1d2b7a 0%, #080b2a 55%, #030513 100%)',
		theme_sunset: 'linear-gradient(145deg, #4b102b 0%, #9a3412 52%, #321018 100%)',
		theme_forest: 'linear-gradient(145deg, #062b18 0%, #064e3b 48%, #02130b 100%)',
		theme_ocean: 'linear-gradient(145deg, #06283d 0%, #075985 48%, #03111c 100%)',
		theme_galaxy: 'radial-gradient(circle at 20% 10%, #7c3aed 0%, #1d0b42 42%, #05020f 100%)',
		theme_inferno: 'radial-gradient(circle at top right, #ff3b1f 0%, #4a0909 46%, #050101 100%)',
		theme_arctic: 'linear-gradient(145deg, #dff7ff 0%, #2f80ff 42%, #07192f 100%)',
		theme_aurora: 'linear-gradient(135deg, #042f2e 0%, #22c55e 35%, #7c3aed 72%, #0b061b 100%)',
		theme_royal: 'linear-gradient(145deg, #2e1065 0%, #6d28d9 45%, #f59e0b 120%)',
	};

	const SKIN_CLASSES: Record<string, string> = {
		skin_minimal: 'card-skin-minimal',
		skin_gradient: 'card-skin-gradient',
		skin_neon: 'card-skin-neon',
		skin_glass: 'card-skin-glass',
		skin_classic: 'card-skin-classic',
		skin_terminal: 'card-skin-terminal',
		skin_hologram: 'card-skin-hologram',
		skin_paper: 'card-skin-paper',
		skin_obsidian: 'card-skin-obsidian',
	};

	async function loadInventory() {
		try {
			const inv = await getInventory();
			activeCosmetics = inv.activeCosmetics ?? {};
		} catch { /* ok */ }
		applyCosmetics();
	}

	let unsub = () => {};
	onMount(() => {
		loadInventory();
		unsub = badgeRefresh.subscribe(() => loadInventory());
	});
	onDestroy(() => unsub());

	function applyCosmetics() {
		const root = document.documentElement;
		root.removeAttribute('data-exam-theme');
		root.classList.remove(...Object.values(SKIN_CLASSES));

		const accentId = activeCosmetics['accent'];
		if (accentId && ACCENT_COLORS[accentId]) {
			const { accent, accentSoft } = ACCENT_COLORS[accentId];
			root.style.setProperty('--accent', accent);
			root.style.setProperty('--accent-soft', accentSoft);
		} else {
			root.style.setProperty('--accent', '#69eff7');
			root.style.setProperty('--accent-soft', 'rgb(105 239 247 / 0.1)');
		}

		const themeId = activeCosmetics['examTheme'];
		if (themeId && THEME_BGS[themeId]) {
			root.dataset.examTheme = themeId;
		}

		const skinId = activeCosmetics['cardSkin'];
		if (skinId && SKIN_CLASSES[skinId]) {
			root.classList.add(SKIN_CLASSES[skinId]);
		}
	}

	$effect(() => {
		if (typeof document !== 'undefined') applyCosmetics();
	});
</script>
