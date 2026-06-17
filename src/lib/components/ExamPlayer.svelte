<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import ScrollbarContainer from '$lib/components/ScrollbarContainer.svelte';
	import type { Exam, Question } from '$lib/types';

	const TOTAL_MINUTES = 10;

	let {
		exam,
		mistakeIds = [],
		onDone = () => {},
		onProgressChange = () => {},
		initialIndex = 0,
		initialAnswers = [],
		initialScore = 0
	} = $props<{
		exam: Exam;
		mistakeIds?: string[];
		onDone?: (result: { score: number; total: number; answers: { questionId: string; selected: number; correct: boolean }[]; mistakes: { question: Question }[] }) => void;
		onProgressChange?: (data: { currentIndex: number; answers: { questionId: string; selected: number; correct: boolean }[]; score: number }) => void;
		initialIndex?: number;
		initialAnswers?: { questionId: string; selected: number; correct: boolean }[];
		initialScore?: number;
	}>();

	let index = $state(initialIndex);
	let selected = $state<number | null>(null);
	let score = $state(initialScore);
	let completed = $state(false);
	let timeLeft = $state(TOTAL_MINUTES * 60);
	let timerActive = $state(true);
	let answers = $state<{ questionId: string; selected: number; correct: boolean }[]>([...initialAnswers]);
	let newMistakes = $state<{ question: Question }[]>([]);

	const current = $derived(exam.questions[index]);
	const isCorrect = $derived(selected === current.correctAnswerIndex);
	const minutes = $derived(Math.floor(timeLeft / 60));
	const seconds = $derived(timeLeft % 60);

	let timerInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		timerInterval = setInterval(() => {
			if (!timerActive || completed) return;
			timeLeft -= 1;
			if (timeLeft <= 0) { timeLeft = 0; timerActive = false; finish(); }
		}, 1000);
		return () => { if (timerInterval) clearInterval(timerInterval); };
	});

	function choose(optionIndex: number) {
		if (selected !== null) return;
		selected = optionIndex;
		timerActive = false;
		if (optionIndex === current.correctAnswerIndex) score += 1;
		else if (!mistakeIds.includes(current.id)) {
			newMistakes = [...newMistakes, { question: current }];
		}
		answers = [...answers, { questionId: current.id, selected: optionIndex, correct: optionIndex === current.correctAnswerIndex }];
		onProgressChange({ currentIndex: index, answers, score });
	}

	function next() {
		if (index === exam.questions.length - 1) { finish(); return; }
		index += 1; selected = null; timerActive = true;
		onProgressChange({ currentIndex: index, answers, score });
	}

	function finish() {
		completed = true;
		if (timerInterval) clearInterval(timerInterval);
		onDone({ score, total: exam.questions.length, answers, mistakes: newMistakes });
		onProgressChange({ currentIndex: -1, answers: [], score: 0 });
	}

	function restart() {
		index = 0; selected = null; score = 0; completed = false;
		timeLeft = TOTAL_MINUTES * 60; timerActive = true; answers = []; newMistakes = [];
		onProgressChange({ currentIndex: -1, answers: [], score: 0 });
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			if (!timerActive || completed) return;
			timeLeft -= 1;
			if (timeLeft <= 0) { timeLeft = 0; timerActive = false; finish(); }
		}, 1000);
	}

	function optLabel(i: number) { return String.fromCharCode(65 + i); }
	function displayQ(text: string) { return text.replace(/_{3,}/g, '__________'); }
</script>

{#if completed}
	<div in:fly={{ y: 12, duration: 180 }} class="card text-center" style="max-width: 480px;">
		<p class="eyebrow">Complete</p>
		<h1 class="mt-5 text-7xl font-black text-white">{score}</h1>
		<p class="mt-1 text-sm font-bold" style="color: var(--text-muted);">out of {exam.questions.length}</p>
		{#if timeLeft <= 0 && answers.length === 0}
			<p class="mt-2 text-sm font-bold" style="color: var(--incorrect);">Time's up</p>
		{/if}
		<p class="mx-auto mt-3 max-w-xs text-sm leading-6" style="color: var(--text-muted);">
			{score >= 8 ? 'You really know this material.' : score >= 5 ? 'Solid effort. A retake will lock it in.' : 'Each attempt builds understanding.'}
		</p>
		<div class="mt-7 grid gap-2 sm:grid-cols-2">
			<Button onclick={restart} variant="primary" class="w-full">Retake</Button>
			<Button href="/mistakes" variant="secondary" class="w-full">Mistakes</Button>
			<Button href="/generate" variant="violet" class="w-full">New exam</Button>
			<Button href="/dashboard" variant="secondary" class="w-full">Dashboard</Button>
		</div>
	</div>

{:else}
	<div style="display: flex; flex-direction: column; height: 100%; gap: 0;">
		<!-- Progress + meta -->
		<div style="margin-bottom: 0.625rem; flex-shrink: 0;">
			<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.375rem;">
				<div style="display: flex; align-items: center; gap: 0.375rem;">
					<span class="text-xs font-bold" style="color: var(--text-muted);">{index + 1}/{exam.questions.length}</span>
					<span class="tag tag-violet">
						{current.type === 'true-false' ? 'T/F' : current.type === 'fill-blank' ? 'Fill' : 'MCQ'}
					</span>
				</div>
				<div style="display: flex; align-items: center; gap: 0.375rem;">
					<span class="tag tag-cyan">{exam.difficulty}</span>
					<span class="text-xs font-bold" style="color: var(--text-muted); font-variant-numeric: tabular-nums;">
						{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
					</span>
				</div>
			</div>
			<div class="progress-seg">
				{#each exam.questions as _, i}
					<div class={['seg', i < index ? 'done' : '', i === index ? 'active' : '']}></div>
				{/each}
			</div>
		</div>

		{#key index}
			<div in:fly={{ x: 10, duration: 160 }} style="display: flex; flex-direction: column; flex: 1; gap: 0.625rem; min-height: 0;">
				<!-- Question (scrollable if long) -->
				<ScrollbarContainer style="flex: 1; min-height: 0;">
					<h2 class="text-xl font-black leading-snug text-white sm:text-2xl">
						{displayQ(current.question)}
					</h2>
				</ScrollbarContainer>

				<!-- Explanation (in the middle after answering) -->
				{#if selected !== null}
					<div in:fly={{ y: 6, duration: 120 }} class="feedback {isCorrect ? 'correct' : 'incorrect'}" style="flex-shrink: 0;">
						<p class="text-sm font-black" style="color: {isCorrect ? 'var(--correct)' : 'var(--incorrect)'};">
							{isCorrect ? 'Correct' : 'Incorrect'}
						</p>
						<p class="mt-1 text-xs leading-5" style="color: var(--text-muted);">{current.explanation}</p>
					</div>
				{/if}

				<!-- Options + button (pushed to bottom, with reserved button space) -->
				<div style="margin-top: auto; flex-shrink: 0; padding-bottom: 1rem;">
					<div style="display: grid; gap: 0.5rem; margin-bottom: 0.5rem;">
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
								<span class="letter">{optLabel(optionIndex)}</span>
								<span>{option}</span>
							</button>
						{/each}
					</div>
					<!-- Reserved space so options don't jump when button appears -->
					<div style="min-height: 3rem;">
						{#if selected !== null}
							<Button class="w-full" onclick={next}>
								{index === exam.questions.length - 1 ? 'See score' : 'Continue'}
							</Button>
						{/if}
					</div>
				</div>
			</div>
		{/key}
	</div>
{/if}
