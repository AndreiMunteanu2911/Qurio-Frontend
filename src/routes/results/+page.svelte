<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { listResults } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { ExamResult } from '$lib/types';

	let results = $state<ExamResult[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			results = await listResults();
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to load results.', 'error');
		} finally {
			loading = false;
		}
	});

	function scoreColor(score: number, total: number) {
		const pct = score / total;
		if (pct >= 0.8) return 'text-cyan-200';
		if (pct >= 0.5) return 'text-yellow-200';
		return 'text-rose-300';
	}
</script>

<svelte:head>
	<title>Results — Qurio</title>
</svelte:head>

<section class="page-stack">
	<div class="section-header">
		<p class="eyebrow">History</p>
		<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Results</h1>
		<p class="mt-3 text-base leading-7 text-violet-100/72">
			Every exam attempt, saved.
		</p>
	</div>

	{#if loading}
		<LoadingCard label="Loading results..." />
	{:else if results.length === 0}
		<div class="soft-card text-center">
			<p class="text-lg font-black text-white">No results yet</p>
			<p class="mt-2 text-sm text-violet-100/60">Complete an exam to see your results here.</p>
			<Button class="mt-4" href="/generate">Create an exam</Button>
		</div>
	{:else}
		<div class="soft-card grid gap-3">
			{#each results as result}
				<div class="soft-panel grid gap-2 p-4">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<h2 class="text-base font-black leading-snug text-white">{result.examTitle}</h2>
							<p class="mt-0.5 text-xs font-bold text-violet-100/50">
								{new Date(result.createdAt).toLocaleDateString()} &middot; {result.difficulty}
							</p>
						</div>
						<p class="shrink-0 text-lg font-black {scoreColor(result.score, result.totalQuestions)}">
							{result.score}/{result.totalQuestions}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
