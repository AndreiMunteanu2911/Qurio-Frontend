<script lang="ts">
	import { onMount } from 'svelte';
	import { getXp } from '$lib/api';

	let {
		compact = false
	} = $props<{
		compact?: boolean;
	}>();

	let totalXp = $state(0);
	let level = $state(1);

	onMount(async () => {
		try {
			const data = await getXp();
			totalXp = data.totalXp;
			level = data.level;
		} catch { /* silent */ }
	});

	const xpInLevel = $derived(totalXp % 100);
	const pct = $derived(xpInLevel / 100);
</script>

<div class="xp-bar {compact ? 'xp-compact' : ''}">
	<div class="xp-label">
		<span class="xp-level">Lv.{level}</span>
		<span class="xp-count">{xpInLevel}/100 XP</span>
	</div>
	<div class="xp-track"><div class="xp-fill" style="width: {pct * 100}%;"></div></div>
</div>

<style>
	.xp-bar {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 8rem;
		flex: 1;
	}
	.xp-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.xp-level { font-size: 0.7rem; font-weight: 800; color: white; }
	.xp-count { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); }
	.xp-track {
		height: 0.375rem;
		border-radius: 999px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.xp-fill {
		height: 100%;
		border-radius: 999px;
		background: var(--cyan);
		transition: width 0.3s ease;
	}
	.xp-compact { min-width: 6rem; }
	.xp-compact .xp-track { height: 0.3rem; }
	.xp-compact .xp-level { font-size: 0.65rem; }
	.xp-compact .xp-count { font-size: 0.55rem; }
</style>
