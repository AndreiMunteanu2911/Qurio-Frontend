<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ScrollbarContainer from '$lib/components/ScrollbarContainer.svelte';
	import { getSharedExam } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { ExamSettings, Question } from '$lib/types';

	let exam = $state<{ id: string; title: string; difficulty: string; questions: Question[]; settings: ExamSettings; createdAt: string } | null>(null);
	let loading = $state(true);
	let index = $state(0);
	let selected = $state<number | null>(null);
	let score = $state(0);
	let completed = $state(false);

	const examId = $derived(page.params.examId!);
	const current = $derived(exam?.questions[index] ?? null);
	const isCorrect = $derived(selected === current?.correctAnswerIndex);
	const showImmediateExplanations = $derived((exam?.settings.explanationMode ?? 'immediate') === 'immediate');
	const scoreRatio = $derived(exam && exam.questions.length > 0 ? score / exam.questions.length : 0);

	onMount(async () => {
		try { exam = await getSharedExam(examId); }
		catch { pushToast('Exam not found.', 'error'); }
		finally { loading = false; }
	});

	function choose(optionIndex: number) {
		if (selected !== null || !current) return;
		selected = optionIndex;
		if (optionIndex === current.correctAnswerIndex) score += 1;
	}
	function next() {
		if (!exam || index >= exam.questions.length - 1) { completed = true; return; }
		index += 1; selected = null;
	}
	function restart() { index = 0; selected = null; score = 0; completed = false; }
	function optLabel(i: number) { return String.fromCharCode(65 + i); }
	function displayQ(text: string) { return text.replace(/_{3,}/g, '__________'); }
</script>

<svelte:head><title>{exam?.title ?? 'Shared Exam'} — Qurio</title></svelte:head>

<div class="shared-exam-player exam-screen" style="display: flex; flex-direction: column; height: 100dvh;">
	{#if loading}
		<LoadingCard label="Loading exam..." />
	{:else if !exam}
		<div class="card text-center py-10">
			<h1 class="text-3xl font-black text-white">Exam not found</h1>
			<p class="mt-3 text-sm" style="color: var(--text-muted);">This exam may have been deleted or the link is invalid.</p>
			<Button class="mt-6" href="/">Go home</Button>
		</div>
	{:else if completed}
		<div in:fly={{ y: 12, duration: 180 }} class="card text-center py-10" style="max-width: 480px;">
			<p class="eyebrow">Complete</p>
			<h1 class="mt-5 text-7xl font-black text-white">{score}</h1>
			<p class="mt-1 text-sm font-bold" style="color: var(--text-muted);">out of {exam.questions.length}</p>
			<p class="mx-auto mt-3 max-w-xs text-sm leading-6" style="color: var(--text-muted);">
				{scoreRatio >= 0.8 ? 'You really know this material.' : scoreRatio >= 0.5 ? 'Solid effort.' : 'Keep practicing.'}
			</p>
			{#if !showImmediateExplanations}
				<div class="mt-5 text-left">
					<p class="mb-2 text-xs font-black" style="color: var(--text-muted);">Answer review</p>
					<div class="grid gap-2 custom-scrollbar" style="max-height: 18rem; overflow: auto;">
						{#each exam.questions as question, questionIndex}
							<div class="rounded-lg p-3" style="background: var(--surface-2);">
								<p class="text-xs font-black text-white">Question {questionIndex + 1}</p>
								<p class="mt-2 text-sm font-bold leading-5 text-white">{displayQ(question.question)}</p>
								<p class="mt-2 text-xs leading-5" style="color: var(--text-muted);">
									Correct answer: <strong class="text-white">{question.options[question.correctAnswerIndex]}</strong>
								</p>
								<p class="mt-1 text-xs leading-5" style="color: var(--text-muted);">{question.explanation}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			<div class="mt-7 grid gap-2">
				<Button onclick={restart}>Retake</Button>
				<Button href="/signup" variant="violet">Create an account</Button>
				<Button href="/" variant="secondary">Home</Button>
			</div>
		</div>
	{:else}
		<!-- Top bar -->
		<div style="flex-shrink: 0; padding-block: 0.25rem 0.35rem;">
			<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.3rem;">
				<p class="text-xs font-bold" style="color: var(--text-muted);">Question {index + 1}/{exam.questions.length}</p>
				<span class="tag tag-cyan">{exam.difficulty}</span>
			</div>
			<div class="progress-seg">
				{#each exam.questions as _, i}
					<div class={['seg', i < index ? 'done' : '', i === index ? 'active' : '']}></div>
				{/each}
			</div>
		</div>

		{#key index}
			<div in:fly={{ x: 10, duration: 160 }} style="display: flex; flex-direction: column; flex: 1; gap: 0.5rem; min-height: 0;">
				<ScrollbarContainer style="flex: 0 1 auto; max-height: clamp(5.5rem, 22dvh, 10.5rem); min-height: 3.5rem;">
					<h2 class="text-lg font-black leading-snug sm:text-xl" style="color: var(--text);">{displayQ(current!.question)}</h2>
				</ScrollbarContainer>

				{#if selected !== null}
					<div in:fly={{ y: 6, duration: 120 }} class="feedback {isCorrect ? 'correct' : 'incorrect'}" style="flex-shrink: 0; max-height: 22dvh; overflow: auto;">
						<p class="text-sm font-black" style="color: {isCorrect ? 'var(--correct)' : 'var(--incorrect)'};">
							{isCorrect ? 'Correct' : 'Incorrect'}
						</p>
						{#if showImmediateExplanations}
							<p class="mt-1 text-xs leading-5" style="color: var(--text-muted);">{current!.explanation}</p>
						{:else}
							<p class="mt-1 text-xs leading-5" style="color: var(--text-muted);">Explanation saved for the final review.</p>
						{/if}
					</div>
				{/if}

				<div style="margin-top: auto; flex-shrink: 0; padding-bottom: 0.5rem;">
					<div style="display: grid; gap: 0.45rem; margin-bottom: 0.45rem;">
						{#each current!.options as option, optionIndex}
							<button
								class={[
									'option',
									selected === null ? '' :
										optionIndex === current!.correctAnswerIndex ? 'correct' :
										selected === optionIndex ? 'incorrect' : 'reveal'
								]}
								disabled={selected !== null}
								onclick={() => choose(optionIndex)}
							>
								<span class="letter">{optLabel(optionIndex)}</span>
								<span>{option}</span>
							</button>
						{/each}
					</div>
					<div style="min-height: 3rem;">
						{#if selected !== null}
							<Button class="w-full" onclick={next}>
								{index >= exam.questions.length - 1 ? 'See score' : 'Continue'}
							</Button>
						{/if}
					</div>
				</div>
			</div>
		{/key}
	{/if}
</div>

<style>
	.shared-exam-player :global(.option) {
		padding: 0.68rem 0.75rem;
		font-size: 0.86rem;
	}
	.shared-exam-player :global(.option .letter) {
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 0.7rem;
	}
	.shared-exam-player :global(.feedback) {
		padding: 0.7rem 0.8rem;
	}
	.shared-exam-player :global(.progress-seg .seg) {
		height: 0.45rem;
	}
</style>
