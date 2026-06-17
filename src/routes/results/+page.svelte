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
		try { results = await listResults(); }
		catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to load results.', 'error'); }
		finally { loading = false; }
	});

	function badgeClass(score: number, total: number) {
		const pct = score / total;
		return pct >= 0.8 ? 'tag tag-cyan' : pct >= 0.5 ? 'tag tag-violet' : 'tag tag-surface';
	}
</script>

<svelte:head><title>Results — Qurio</title></svelte:head>

<section class="page-stack">
	<div class="card-accent cyan">
		<p class="eyebrow">History</p>
		<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">Results</h1>
		<p class="mt-1.5 text-sm leading-6" style="color: var(--text-muted); max-width: 440px;">
			Every exam attempt, saved.
		</p>
	</div>

	{#if loading}
		<LoadingCard label="Loading results..." />
	{:else if results.length === 0}
		<div class="card text-center" style="max-width: 400px;">
			<p class="text-base font-black text-white">No results yet</p>
			<p class="mt-1 text-xs" style="color: var(--text-muted);">Complete an exam to see your results here.</p>
			<Button class="mt-3" href="/generate">Create exam</Button>
		</div>
	{:else}
		<div class="card">
			<div class="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
				{#each results as result}
					<div class="option cursor-default">
						<div class="flex w-full items-start justify-between gap-2">
							<div class="min-w-0">
								<h2 class="text-sm font-black leading-snug text-white">{result.examTitle}</h2>
								<p class="mt-0.5 text-xs font-bold" style="color: var(--text-muted);">
									{new Date(result.createdAt).toLocaleDateString()} · {result.difficulty}
								</p>
							</div>
							<p class="shrink-0 {badgeClass(result.score, result.totalQuestions)}">{result.score}/{result.totalQuestions}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>
