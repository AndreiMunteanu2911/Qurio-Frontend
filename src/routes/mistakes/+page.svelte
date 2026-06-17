<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { listMistakes, deleteMistake } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Mistake } from '$lib/types';

	let mistakes = $state<Mistake[]>([]);
	let loading = $state(true);
	let reviewIndex = $state<number | null>(null);
	let selected = $state<number | null>(null);
	let mistakesDone = $state(0);
	let completed = $state(false);

	onMount(async () => {
		try { mistakes = await listMistakes(); }
		catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to load mistakes.', 'error'); }
		finally { loading = false; }
	});

	const current = $derived(reviewIndex !== null ? mistakes[reviewIndex].question : null);

	function startReview() { reviewIndex = 0; selected = null; mistakesDone = 0; completed = false; }
	function choose(i: number) {
		if (selected !== null || !current) return;
		selected = i;
		if (i === current.correctAnswerIndex) mistakesDone += 1;
	}
	function next() {
		if (!current || selected === null) return;
		if (selected === current.correctAnswerIndex) deleteMistake(mistakes[reviewIndex!].id).catch(() => {});
		if (reviewIndex! >= mistakes.length - 1) { completed = true; return; }
		reviewIndex! += 1; selected = null;
	}
	function restart() { reviewIndex = null; selected = null; mistakesDone = 0; completed = false; }
	function optLabel(i: number) { return String.fromCharCode(65 + i); }
	function displayQ(text: string) { return text.replace(/_{3,}/g, '__________'); }
</script>

<svelte:head><title>Review Mistakes — Qurio</title></svelte:head>

<section class="page-stack">
	<div class="card-accent violet">
		<p class="eyebrow">Mistakes</p>
		<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">Review incorrect answers</h1>
		<p class="mt-1.5 text-sm leading-6" style="color: var(--text-muted); max-width: 440px;">
			Questions you've gotten wrong. Answer correctly to clear them.
		</p>
	</div>

	{#if loading}
		<LoadingCard label="Loading mistakes..." />
	{:else if mistakes.length === 0}
		<div class="card text-center" style="max-width: 400px;">
			<p class="text-base font-black text-white">No mistakes yet</p>
			<p class="mt-1 text-xs" style="color: var(--text-muted);">Questions answered incorrectly will appear here.</p>
			<Button class="mt-3" href="/generate">Create exam</Button>
		</div>
	{:else if reviewIndex === null}
		<div class="card" style="max-width: 400px;">
			<p class="text-sm font-black" style="color: var(--text-muted);">
				{mistakes.length} question{mistakes.length > 1 ? 's' : ''} to review
			</p>
			<Button class="mt-3 w-full" onclick={startReview}>Start review</Button>
		</div>
	{:else if completed}
		<div in:fly={{ y: 12, duration: 180 }} class="card text-center" style="max-width: 440px;">
			<p class="eyebrow">Review complete</p>
			<h1 class="mt-4 text-5xl font-black text-white">{mistakesDone}</h1>
			<p class="mt-0.5 text-xs font-bold" style="color: var(--text-muted);">out of {mistakes.length} cleared</p>
			<div class="mt-5 grid gap-2">
				<Button onclick={restart}>Review again</Button>
				<Button href="/dashboard" variant="secondary">Dashboard</Button>
				<Button href="/generate" variant="violet">Create new exam</Button>
			</div>
		</div>
	{:else if current}
		{#key reviewIndex}
			<div in:fly={{ x: 10, duration: 160 }} style="max-width: 560px;">
				<div class="card-sm">
					<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
						<p class="text-xs font-bold" style="color: var(--text-muted);">Review {reviewIndex! + 1} / {mistakes.length}</p>
						<span class="tag tag-violet">{current.type === 'true-false' ? 'T/F' : current.type === 'fill-blank' ? 'Fill' : 'MCQ'}</span>
					</div>
					<div class="progress-seg mt-1.5">
						{#each mistakes as _, i}
							<div class={['seg', i < reviewIndex! ? 'done' : '', i === reviewIndex! ? 'active' : '']}></div>
						{/each}
					</div>
				</div>

				<div style="display: flex; flex-direction: column; gap: 0.625rem; margin-top: 0.625rem;">
					<h2 class="text-lg font-black leading-snug text-white">{displayQ(current.question)}</h2>

					{#if selected !== null}
						<div in:fly={{ y: 6, duration: 120 }} class="feedback {selected === current.correctAnswerIndex ? 'correct' : 'incorrect'}">
							<p class="text-sm font-black" style="color: {selected === current.correctAnswerIndex ? 'var(--correct)' : 'var(--incorrect)'};">
								{selected === current.correctAnswerIndex ? 'Correct' : 'Incorrect'}
							</p>
							<p class="mt-1 text-xs leading-5" style="color: var(--text-muted);">{current.explanation}</p>
						</div>
					{/if}

					<div style="flex-shrink: 0;">
						<div class="grid gap-1.5">
							{#each current.options as option, optionIndex}
								<button
									class={[
										'option',
										selected === null ? '' :
											optionIndex === current.correctAnswerIndex ? 'correct' :
											selected === optionIndex ? 'incorrect' : 'reveal'
									]}
									disabled={selected !== null}
									onclick={() => choose(optionIndex)}
								>
									<span class="letter">{optLabel(optionIndex)}</span><span>{option}</span>
								</button>
							{/each}
						</div>
						{#if selected !== null}
							<Button class="w-full mt-2" onclick={next}>
								{reviewIndex! >= mistakes.length - 1 ? 'See results' : 'Continue'}
							</Button>
						{/if}
					</div>
				</div>
			</div>
		{/key}
	{/if}
</section>
