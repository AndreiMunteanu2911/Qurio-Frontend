<script lang="ts">
	import { getXp } from '$lib/api';
	import { badgeRefresh } from '$lib/refresh';

	let {
		compact = false
	} = $props<{
		compact?: boolean;
	}>();

	let totalXp = $state(0);
	let level = $state(1);

	async function fetchXp() {
		try {
			const data = await getXp();
			totalXp = data.totalXp;
			level = data.level;
		} catch { /* silent */ }
	}

	$effect(() => {
		$badgeRefresh;
		fetchXp();
	});

	function cumulativeXpForLevel(lv: number): number {
		if (lv <= 1) return 0;
		return Math.floor(25 * (lv - 1) * (lv + 6) / 2);
	}

	function xpForNextLevel(lv: number): number {
		return 100 + (lv - 1) * 25;
	}

	const xpInLevel = $derived(totalXp - cumulativeXpForLevel(level));
	const needed = $derived(xpForNextLevel(level));
	const pct = $derived(needed > 0 ? xpInLevel / needed : 0);
</script>

<div class="xp-bar {compact ? 'xp-compact' : ''}">
	<div class="xp-label">
		<span class="xp-level">Lv.{level}</span>
		<span class="xp-count">{xpInLevel}/{needed} XP</span>
	</div>
	<div class="xp-track"><div class="xp-fill" style="width: {pct * 100}%;"></div></div>
</div>

<style>
	.xp-bar {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 8rem;
		flex: 1;
		border: 2px solid var(--border);
		border-radius: 999px;
		background: #ffffff;
		padding: 0.45rem 0.6rem;
		box-shadow: 0 5px 0 #d8cfff;
	}
	.xp-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.xp-level { font-size: 0.7rem; font-weight: 950; color: var(--violet); }
	.xp-count { font-size: 0.6rem; font-weight: 850; color: var(--text-muted); }
	.xp-track {
		height: 0.5rem;
		border-radius: 999px;
		background: #dfe8ff;
		overflow: hidden;
		box-shadow: inset 0 2px 0 rgb(19 10 43 / 0.08);
	}
	.xp-fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--violet), var(--cyan));
		transition: width 0.3s ease;
	}
	.xp-compact { min-width: 6rem; }
	.xp-compact .xp-track { height: 0.3rem; }
	.xp-compact .xp-level { font-size: 0.65rem; }
	.xp-compact .xp-count { font-size: 0.55rem; }
</style>
