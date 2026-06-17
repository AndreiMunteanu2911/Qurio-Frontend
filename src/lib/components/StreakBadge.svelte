<script lang="ts">
	import { onMount } from 'svelte';
	import { getStreak } from '$lib/api';
	import { IconFlame } from '@tabler/icons-svelte';

	let currentStreak = $state(0);

	onMount(async () => {
		try { const data = await getStreak(); currentStreak = data.currentStreak; }
		catch { /* silent */ }
	});
</script>

<div class="streak-badge" class:active={currentStreak > 0}>
	<IconFlame size={14} stroke-width={2.5} />
	<span class="streak-count">{currentStreak}</span>
</div>

<style>
	.streak-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		padding: 0.25rem 0.45rem;
		border-radius: var(--radius-sm);
		background: rgb(255 255 255 / 0.05);
		opacity: 0.4;
		line-height: 1;
		color: var(--text-muted);
	}
	.streak-badge.active {
		opacity: 1;
		color: var(--cyan);
	}
	.streak-count {
		font-size: 0.75rem;
		font-weight: 800;
		line-height: 1;
		color: currentColor;
	}
</style>
