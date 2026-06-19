<script lang="ts">
	import { getStreak } from '$lib/api';
	import { badgeRefresh } from '$lib/refresh';
	import { IconFlame } from '@tabler/icons-svelte';

	let currentStreak = $state(0);

	async function fetchStreak() {
		try { const data = await getStreak(); currentStreak = data.currentStreak; }
		catch { /* silent */ }
	}

	$effect(() => {
		$badgeRefresh;
		fetchStreak();
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
		gap: 0.2rem;
		padding: 0.42rem 0.6rem;
		border: 2px solid var(--border);
		border-radius: 999px;
		background: #ffffff;
		opacity: 0.65;
		line-height: 1;
		color: var(--text-muted);
		box-shadow: 0 5px 0 #d8cfff;
	}
	.streak-badge.active {
		opacity: 1;
		border-color: var(--accent-shadow);
		background: var(--cyan-soft);
		color: var(--cyan);
		box-shadow: 0 5px 0 var(--accent-shadow);
	}
	.streak-count {
		font-size: 0.75rem;
		font-weight: 950;
		line-height: 1;
		color: currentColor;
	}
</style>
