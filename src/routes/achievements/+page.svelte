<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { getAchievements } from '$lib/api';
	import type { Achievement } from '$lib/types';
	import {
		IconAward, IconTarget, IconFlame, IconBooks, IconStar, IconChartBar, IconCircleCheck
	} from '@tabler/icons-svelte';

	let achievements = $state<Achievement[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try { achievements = await getAchievements(); }
		catch { /* ok */ }
		finally { loading = false; }
	});

	const unlockedCount = $derived(achievements.filter((a) => a.unlocked).length);

	function iconFor(id: string) {
		if (id.startsWith('streak')) return IconFlame;
		if (id.startsWith('perfect') || id === 'mistake_free') return IconCircleCheck;
		if (id === 'all_difficulties') return IconChartBar;
		if (id.endsWith('_exams')) return IconBooks;
		if (id.endsWith('_correct')) return IconStar;
		if (id === 'first_exam') return IconAward;
		return IconAward;
	}
</script>

<svelte:head><title>Achievements — Qurio</title></svelte:head>

{#if loading}
	<LoadingCard label="Loading achievements..." />
{:else}
	<section class="page-stack">
		<div class="card-accent violet">
			<p class="eyebrow">Achievements</p>
			<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">
				{unlockedCount} / {achievements.length} unlocked
			</h1>
			<p class="mt-1.5 text-sm leading-6" style="color: var(--text-muted); max-width: 440px;">
				Complete exams, build streaks, and earn every badge.
			</p>
		</div>

		<div class="card">
			<div class="grid gap-1.5 sm:grid-cols-2">
				{#each achievements as ach}
					{@const Icon = iconFor(ach.id)}
					<div class="option cursor-default" style="opacity: {ach.unlocked ? 1 : 0.35};">
						<div class="flex items-center gap-2">
							<Icon size={18} stroke-width={2} style="color: {ach.unlocked ? 'var(--cyan)' : 'var(--text-muted)'}; flex-shrink: 0;" />
							<p class="text-xs font-black text-white">{ach.name}</p>
							{#if ach.unlocked}
								<span class="tag tag-cyan" style="font-size: 0.6rem;">Done</span>
							{/if}
						</div>
						<p class="mt-0.5 text-[0.65rem] leading-tight" style="color: var(--text-muted);">{ach.description}</p>
					</div>
				{/each}
			</div>
		</div>

		<Button href="/profile" variant="secondary" class="w-full">Back to profile</Button>
	</section>
{/if}
