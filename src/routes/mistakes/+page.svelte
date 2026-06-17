<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { listMistakes, deleteMistake } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Mistake, Question } from '$lib/types';

	let mistakes = $state<Mistake[]>([]);
	let loading = $state(true);

	let reviewIndex = $state<number | null>(null);
	let selected = $state<number | null>(null);
	let mistakesDone = $state(0);
	let completed = $state(false);

	onMount(async () => {
		try {
			mistakes = await listMistakes();
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to load mistakes.', 'error');
		} finally {
			loading = false;
		}
	});

	const current = $derived(reviewIndex !== null ? mistakes[reviewIndex].question : null);

	function startReview() {
		reviewIndex = 0;
		selected = null;
		mistakesDone = 0;
		completed = false;
	}

	function choose(optionIndex: number) {
		if (selected !== null || !current) return;
		selected = optionIndex;

		if (optionIndex === current.correctAnswerIndex) {
			mistakesDone += 1;
		}
	}

	function next() {
		if (!current || selected === null) return;

		if (selected === current.correctAnswerIndex) {
			const m = mistakes[reviewIndex!];
			deleteMistake(m.id).catch(() => {});
		}

		if (reviewIndex! >= mistakes.length - 1) {
			completed = true;
			return;
		}

		reviewIndex! += 1;
		selected = null;
	}

	function restart() {
		reviewIndex = null;
		selected = null;
		mistakesDone = 0;
		completed = false;
	}

	function optionLabel(i: number) {
		return String.fromCharCode(65 + i);
	}

	function displayQuestion(text: string) {
		return text.replace(/_{3,}/g, '__________');
	}
</script>

<svelte:head>
	<title>Review Mistakes — Qurio</title>
</svelte:head>

<section class="page-stack">
	<div class="section-header">
		<p class="eyebrow">Mistakes</p>
		<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Review incorrect answers</h1>
		<p class="mt-3 text-base leading-7 text-violet-100/72">
			Questions you've gotten wrong. Answer correctly to clear them.
		</p>
	</div>

	{#if loading}
		<LoadingCard label="Loading mistakes..." />
	{:else if mistakes.length === 0}
		<div class="soft-card text-center">
			<p class="text-lg font-black text-white">No mistakes yet</p>
			<p class="mt-2 text-sm text-violet-100/60">Questions answered incorrectly will appear here.</p>
			<Button class="mt-4" href="/generate">Create an exam</Button>
		</div>
	{:else if reviewIndex === null}
		<div class="soft-card">
			<p class="text-sm font-bold text-violet-200">
				{mistakes.length} question{mistakes.length > 1 ? 's' : ''} to review
			</p>
			<Button class="mt-4 w-full" onclick={startReview}>Start review</Button>
		</div>
	{:else if completed}
		<div in:fly={{ y: 16, duration: 220 }} class="soft-card text-center">
			<p class="eyebrow">Review complete</p>
			<h1 class="mt-4 text-5xl font-black text-white">{mistakesDone}</h1>
			<p class="mt-1 text-sm font-black text-violet-100">out of {mistakes.length} cleared</p>
			<div class="mt-6 grid gap-2">
				<Button onclick={restart}>Review again</Button>
				<Button href="/dashboard" variant="secondary">Dashboard</Button>
				<Button href="/generate" variant="violet">Create new exam</Button>
			</div>
		</div>
	{:else if current}
		{#key reviewIndex}
			<div in:fly={{ x: 24, duration: 220 }} class="soft-card grid gap-5">
				<div class="flex items-center justify-between gap-3 px-1">
					<p class="text-xs font-black text-violet-200">Review {reviewIndex! + 1} / {mistakes.length}</p>
					<p class="rounded-full bg-cyan-200/12 px-2.5 py-1 text-xs font-black capitalize text-cyan-200">{mistakes[reviewIndex!].difficulty}</p>
				</div>

				<h2 class="text-2xl font-black leading-tight text-white">{displayQuestion(current.question)}</h2>

				<div class="grid gap-3">
					{#each current.options as option, optionIndex}
						<button
							class={[
								'pressable rounded-lg px-4 py-4 text-left text-sm font-extrabold',
								selected === null
									? 'bg-[#1b1037] text-violet-50 hover:bg-[#25164a]'
									: optionIndex === current.correctAnswerIndex
										? 'border border-cyan-100 bg-cyan-300 text-[#070020]'
										: selected === optionIndex
											? 'border border-rose-200 bg-rose-500 text-white'
											: 'border-white/10 bg-white/[0.03] text-violet-200'
							]}
							disabled={selected !== null}
							onclick={() => choose(optionIndex)}
						>
							<span class="mr-3 inline-block w-5 shrink-0 font-black">{optionLabel(optionIndex)}</span>
							{option}
						</button>
					{/each}
				</div>

				{#if selected !== null}
					<div
						in:fly={{ y: 12, duration: 180 }}
						class={[
							'rounded-lg border p-4',
							selected === current.correctAnswerIndex
								? 'border-cyan-200/60 bg-cyan-400/15'
								: 'border-rose-200/60 bg-rose-500/15'
						]}
					>
						<p class="font-black">
							{selected === current.correctAnswerIndex ? 'Correct' : 'Not quite'}
						</p>
						<p class="mt-2 text-sm leading-6 text-violet-50">{current.explanation}</p>
					</div>

					<Button class="w-full" onclick={next}>
						{reviewIndex! >= mistakes.length - 1 ? 'See results' : 'Next question'}
					</Button>
				{/if}
			</div>
		{/key}
	{/if}
</section>
