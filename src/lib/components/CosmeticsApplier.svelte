<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getInventory } from '$lib/api';
	import { badgeRefresh } from '$lib/refresh';

	let activeCosmetics = $state<Record<string, string>>({});

	const ACCENT_COLORS: Record<string, { accent: string; accentSoft: string; accentShadow: string }> = {
		accent_gold: { accent: '#d99a00', accentSoft: '#fff2bf', accentShadow: '#e7c95a' },
		accent_rose: { accent: '#ff3f8e', accentSoft: '#ffe1ef', accentShadow: '#eba4c5' },
		accent_emerald: { accent: '#0ea66b', accentSoft: '#dff9ed', accentShadow: '#9ddfbd' },
		accent_sapphire: { accent: '#2f80ff', accentSoft: '#e7f1ff', accentShadow: '#9cc7ff' },
		accent_amber: { accent: '#e87800', accentSoft: '#fff0d6', accentShadow: '#e8bd72' },
		accent_crimson: { accent: '#e7354a', accentSoft: '#ffe2e6', accentShadow: '#eca0aa' },
		accent_lime: { accent: '#78a800', accentSoft: '#eef8cb', accentShadow: '#c5df78' },
		accent_orchid: { accent: '#b43ad8', accentSoft: '#f6e1ff', accentShadow: '#d9a3ea' },
		accent_ice: { accent: '#1e9bd7', accentSoft: '#ddf4ff', accentShadow: '#9ad9f3' },
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
			const next = inv.activeCosmetics ?? {};
			activeCosmetics = next;
			applyCosmetics(next);
		} catch { /* ok */ }
	}

	let unsub = () => {};
	onMount(() => {
		loadInventory();
		unsub = badgeRefresh.subscribe(() => loadInventory());
	});
	onDestroy(() => unsub());

	function applyCosmetics(cosmetics = activeCosmetics) {
		const root = document.documentElement;
		root.removeAttribute('data-exam-theme');
		root.classList.remove(...Object.values(SKIN_CLASSES));

		const accentId = cosmetics['accent'];
		if (accentId && ACCENT_COLORS[accentId]) {
			const { accent, accentSoft, accentShadow } = ACCENT_COLORS[accentId];
			root.style.setProperty('--accent', accent);
			root.style.setProperty('--accent-soft', accentSoft);
			root.style.setProperty('--violet', accent);
			root.style.setProperty('--violet-soft', accentSoft);
			root.style.setProperty('--cyan', accent);
			root.style.setProperty('--cyan-soft', accentSoft);
			root.style.setProperty('--border-strong', accent);
			root.style.setProperty('--accent-shadow', accentShadow);
		} else {
			root.style.setProperty('--accent', '#6849ff');
			root.style.setProperty('--accent-soft', '#ebe6ff');
			root.style.setProperty('--violet', '#6849ff');
			root.style.setProperty('--violet-soft', '#ebe6ff');
			root.style.setProperty('--cyan', '#2f80ff');
			root.style.setProperty('--cyan-soft', '#e7f1ff');
			root.style.setProperty('--border-strong', '#9f86ff');
			root.style.setProperty('--accent-shadow', '#b8a9ff');
		}

		const themeId = cosmetics['examTheme'];
		if (themeId && THEME_BGS[themeId]) {
			root.dataset.examTheme = themeId;
		}

		const skinId = cosmetics['cardSkin'];
		if (skinId && SKIN_CLASSES[skinId]) {
			root.classList.add(SKIN_CLASSES[skinId]);
		}
	}

	$effect(() => {
		if (typeof document !== 'undefined') applyCosmetics();
	});
</script>
