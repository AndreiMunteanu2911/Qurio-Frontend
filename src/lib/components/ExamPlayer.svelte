<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import ScrollbarContainer from '$lib/components/ScrollbarContainer.svelte';
	import type { Exam, Question } from '$lib/types';
	import { IconBulb, IconArrowRight, IconRotate } from '@tabler/icons-svelte';

	let {
		exam,
		mistakeIds = [],
		onDone = () => {},
		onProgressChange = () => {},
		initialIndex = 0,
		initialAnswers = [],
		initialScore = 0,
		powerUps = [],
		onUseItem = async (_itemId: string) => {},
		onRestart = () => {},
	} = $props<{
		exam: Exam;
		mistakeIds?: string[];
		onDone?: (result: {
			score: number; total: number;
			answers: { questionId: string; selected: number; correct: boolean }[];
			mistakes: { question: Question }[];
			powerUpsUsed: string[];
			secondChanceCorrected: number;
		}) => void;
		onProgressChange?: (data: { currentIndex: number; answers: { questionId: string; selected: number; correct: boolean }[]; score: number }) => void;
		initialIndex?: number;
		initialAnswers?: { questionId: string; selected: number; correct: boolean }[];
		initialScore?: number;
		powerUps?: { itemId: string; quantity: number }[];
		onUseItem?: (itemId: string) => Promise<void>;
		onRestart?: () => void;
	}>();

	let index = $state.by(() => initialIndex);
	let selected = $state<number | null>(null);
	let score = $state.by(() => initialScore);
	let completed = $state(false);
	let timeLeft = $state.by(() => (exam.settings?.timeLimitMinutes ?? 10) * 60);
	let timerActive = $state(true);
	let answers = $state.by<{ questionId: string; selected: number; correct: boolean }[]>(() => [...initialAnswers]);
	let newMistakes = $state<{ question: Question }[]>([]);
	let powerUpsUsed = $state<string[]>([]);
	let revealedOptions = $state<Set<number>>(new Set());
	let hintUsedThisQ = $state(false);
	let secondChanceActive = $state(false);
	let secondChanceQ = $state<{ index: number; question: Question } | null>(null);
	let secondChanceAnswered = $state(false);
	let secondChanceCorrected = $state(0);

	const ownPowerUps = $derived(new Set(powerUps.filter((p) => p.quantity > 0).map((p) => p.itemId)));

	const current = $derived(
		secondChanceActive && secondChanceQ ? secondChanceQ.question : exam.questions[index]
	);
	const currentIndex = $derived(secondChanceActive && secondChanceQ ? secondChanceQ.index : index);
	const isDone = $derived(secondChanceActive ? secondChanceAnswered : false);
	const isCorrect = $derived(selected === current.correctAnswerIndex);
	const timeLimitSeconds = $derived((exam.settings?.timeLimitMinutes ?? 10) * 60);
	const showImmediateExplanations = $derived((exam.settings?.explanationMode ?? 'immediate') === 'immediate');
	const answerMap = $derived(new Map(answers.map((answer) => [answer.questionId, answer])));
	const scoreRatio = $derived(exam.questions.length > 0 ? score / exam.questions.length : 0);
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
		if (revealedOptions.has(optionIndex)) return;
		selected = optionIndex;
		timerActive = false;

		if (secondChanceActive && secondChanceQ) {
			secondChanceAnswered = true;
			if (optionIndex === current.correctAnswerIndex) {
				secondChanceCorrected += 1;
				score += 1;
			}
			return;
		}

		if (optionIndex === current.correctAnswerIndex) score += 1;
		else if (!mistakeIds.includes(current.id)) {
			newMistakes = [...newMistakes, { question: current }];
		}
		answers = [...answers, { questionId: current.id, selected: optionIndex, correct: optionIndex === current.correctAnswerIndex }];
		onProgressChange({ currentIndex: index, answers, score });
	}

	async function useHint() {
		if (!ownPowerUps.has('hint') || hintUsedThisQ || selected !== null) return;
		hintUsedThisQ = true;
		await onUseItem('hint');
		powerUpsUsed = [...powerUpsUsed, 'hint'];
		const wrong = current.options
			.map((_, i) => i)
			.filter((i) => i !== current.correctAnswerIndex && !revealedOptions.has(i));
		if (wrong.length > 0) {
			const pick = wrong[Math.floor(Math.random() * wrong.length)];
			revealedOptions = new Set([...revealedOptions, pick]);
		}
	}

	async function useSkip() {
		if (!ownPowerUps.has('skip') || selected !== null) return;
		await onUseItem('skip');
		powerUpsUsed = [...powerUpsUsed, 'skip'];
		if (index === exam.questions.length - 1) { finish(); return; }
		index += 1; selected = null; timerActive = true; hintUsedThisQ = false; revealedOptions = new Set();
		onProgressChange({ currentIndex: index, answers, score });
	}

	function next() {
		if (secondChanceActive) {
			secondChanceActive = false; secondChanceQ = null; secondChanceAnswered = false;
			finish();
			return;
		}

		if (index === exam.questions.length - 1) {
			finish(); return;
		}
		index += 1; selected = null; timerActive = true; hintUsedThisQ = false; revealedOptions = new Set();
		onProgressChange({ currentIndex: index, answers, score });
	}

	async function activateSecondChance() {
		await onUseItem('second_chance');
		powerUpsUsed = [...powerUpsUsed, 'second_chance'];
		// Find first wrong answer
		const wrongIdx = answers.findIndex((a) => !a.correct);
		if (wrongIdx >= 0) {
			secondChanceQ = { index: wrongIdx, question: exam.questions[wrongIdx] };
			secondChanceActive = true;
			secondChanceAnswered = false;
			selected = null;
			hintUsedThisQ = false;
			revealedOptions = new Set();
			timerActive = true;
		} else {
			finish();
		}
	}

	function skipSecondChance() {
		finish();
	}

	function finish() {
		completed = true;
		if (timerInterval) clearInterval(timerInterval);
		onDone({
			score, total: exam.questions.length, answers,
			mistakes: newMistakes,
			powerUpsUsed,
			secondChanceCorrected
		});
		onProgressChange({ currentIndex: -1, answers: [], score: 0 });
	}

	function restart() {
		onRestart();
		index = 0; selected = null; score = 0; completed = false;
		timeLeft = timeLimitSeconds; timerActive = true; answers = []; newMistakes = [];
		powerUpsUsed = []; revealedOptions = new Set(); hintUsedThisQ = false;
		secondChanceActive = false; secondChanceQ = null; secondChanceAnswered = false; secondChanceCorrected = 0;
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
	<div class="grid h-full place-items-center overflow-auto p-4">
		<div in:fly={{ y: 12, duration: 180 }} class="card w-full text-center" style="max-width: 480px;">
			<p class="eyebrow">Complete</p>
			<h1 class="mt-5 text-7xl font-black text-white">{score}</h1>
			<p class="mt-1 text-sm font-bold" style="color: var(--text-muted);">out of {exam.questions.length}</p>
			{#if timeLeft <= 0 && answers.length === 0}
				<p class="mt-2 text-sm font-bold" style="color: var(--incorrect);">Time's up</p>
			{/if}
			<p class="mx-auto mt-3 max-w-xs text-sm leading-6" style="color: var(--text-muted);">
				{scoreRatio >= 0.8 ? 'You really know this material.' : scoreRatio >= 0.5 ? 'Solid effort. A retake will lock it in.' : 'Each attempt builds understanding.'}
			</p>
			{#if !showImmediateExplanations}
				<div class="mt-5 text-left">
					<p class="mb-2 text-xs font-black" style="color: var(--text-muted);">Answer review</p>
					<div class="grid gap-2 custom-scrollbar" style="max-height: 18rem; overflow: auto;">
						{#each exam.questions as question, questionIndex}
							{@const answer = answerMap.get(question.id)}
							<div class="rounded-lg p-3" style="background: var(--surface-2);">
								<div class="flex items-center justify-between gap-2">
									<p class="text-xs font-black text-white">Question {questionIndex + 1}</p>
									<span class={['tag', answer?.correct ? 'tag-cyan' : 'tag-violet']}>{answer?.correct ? 'Correct' : 'Missed'}</span>
								</div>
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
			<div class="mt-7 grid gap-2 sm:grid-cols-2">
				<Button onclick={restart} variant="primary" class="w-full">Retake</Button>
				<Button href="/mistakes" variant="secondary" class="w-full">Mistakes</Button>
				<Button href="/generate" variant="violet" class="w-full">New exam</Button>
				<Button href="/dashboard" variant="secondary" class="w-full">Dashboard</Button>
			</div>
		</div>
	</div>

{:else}
	<div class="exam-player" style="display: flex; flex-direction: column; height: 100%; gap: 0;">
		<!-- Progress + meta -->
		<div style="margin-bottom: 0.35rem; flex-shrink: 0;">
			<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.3rem;">
				<div style="display: flex; align-items: center; gap: 0.375rem;">
					<span class="text-xs font-bold" style="color: var(--text-muted);">{currentIndex + 1}/{exam.questions.length}</span>
				</div>
				<div style="display: flex; align-items: center; gap: 0.375rem;">
					{#if ownPowerUps.has('hint') && !hintUsedThisQ && selected === null && !secondChanceActive}
						<button
							class="pressable flex h-6 w-6 items-center justify-center rounded-full"
							style="background: rgb(255 200 0 / 0.12); color: #ffc800;"
							onclick={useHint}
							title="Hint: reveal a wrong option"
						><IconBulb size={13} stroke-width={2} /></button>
					{/if}
					{#if ownPowerUps.has('skip') && selected === null && !secondChanceActive}
						<button
							class="pressable flex h-6 w-6 items-center justify-center rounded-full"
							style="background: var(--surface-3); color: var(--text-muted);"
							onclick={useSkip}
							title="Skip this question"
						><IconArrowRight size={13} stroke-width={2} /></button>
					{/if}
					<span class="tag tag-cyan">{exam.difficulty}</span>
					<svg width="34" height="34" viewBox="0 0 48 48" style="display: block; flex-shrink: 0;">
						<circle cx="24" cy="24" r="20" fill="none" stroke="rgb(255 255 255 / 0.08)" stroke-width="3.5"/>
						<circle
							cx="24"
							cy="24"
							r="20"
							fill="none"
							stroke-width="3.5"
							stroke-linecap="round"
							stroke-dasharray="125.66"
							stroke-dashoffset={125.66 * (1 - timeLeft / timeLimitSeconds)}
							transform="rotate(-90 24 24)"
							style="stroke: var(--accent); transition: stroke-dashoffset 1s linear;"
						/>
						<text
							x="24"
							y="24"
							text-anchor="middle"
							dominant-baseline="central"
							font-size="11"
							font-weight="800"
							font-family="var(--font-sans)"
							fill="var(--text)"
							style="font-variant-numeric: tabular-nums;"
						>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</text>
					</svg>
				</div>
			</div>
			<div class="progress-seg">
				{#each exam.questions as _, i}
					<div class={['seg', i < index ? 'done' : '', i === index ? 'active' : '']}></div>
				{/each}
			</div>
		</div>

		{#key currentIndex + (secondChanceActive ? '_sc' : '')}
			<div in:fly={{ x: 10, duration: 160 }} style="display: flex; flex-direction: column; flex: 1; gap: 0.5rem; min-height: 0;">
				<!-- Question (scrollable if long) -->
				<ScrollbarContainer style="flex: 0 1 auto; max-height: clamp(5.5rem, 22dvh, 10.5rem); min-height: 3.5rem;">
					<h2 class="text-lg font-black leading-snug sm:text-xl" style="color: var(--text);">
						{displayQ(current.question)}
					</h2>
					{#if secondChanceActive}
						<p class="mt-2 text-xs font-bold" style="color: var(--cyan);">Second chance — retry one wrong answer</p>
					{/if}
				</ScrollbarContainer>

				<!-- Explanation (in the middle after answering) -->
				{#if selected !== null}
					<div in:fly={{ y: 6, duration: 120 }} class="feedback {isCorrect ? 'correct' : 'incorrect'}" style="flex-shrink: 0; max-height: 22dvh; overflow: auto;">
						<p class="text-sm font-black" style="color: {isCorrect ? 'var(--correct)' : 'var(--incorrect)'};">
							{isCorrect ? 'Correct' : 'Incorrect'}
						</p>
						{#if showImmediateExplanations}
							<p class="mt-1 text-xs leading-5" style="color: var(--text-muted);">{current.explanation}</p>
						{:else}
							<p class="mt-1 text-xs leading-5" style="color: var(--text-muted);">Explanation saved for the final review.</p>
						{/if}
					</div>
				{/if}

				<!-- Options + button (pushed to bottom, with reserved button space) -->
				<div style="margin-top: auto; flex-shrink: 0; padding-bottom: 0.5rem;">
					<div style="display: grid; gap: 0.45rem; margin-bottom: 0.45rem;">
						{#each current.options as option, optionIndex}
							<button
								class={[
									'option',
									revealedOptions.has(optionIndex) ? 'reveal' : '',
									selected === null ? '' :
										optionIndex === current.correctAnswerIndex ? 'correct' :
										selected === optionIndex ? 'incorrect' : 'reveal'
								]}
								disabled={selected !== null || revealedOptions.has(optionIndex)}
								onclick={() => choose(optionIndex)}
							>
								<span class="letter">{optLabel(optionIndex)}</span>
								<span>{option}</span>
							</button>
						{/each}
					</div>
					<!-- Reserved space so options don't jump when button appears -->
					<div style="min-height: 3rem;">
						{#if isDone}
							<Button class="w-full" onclick={next}>Continue</Button>
						{:else if selected !== null}
							<!-- Second chance: last question's Continue leads to finish -->
							<Button class="w-full" onclick={next}>
								{secondChanceActive || index === exam.questions.length - 1 ? 'See score' : 'Continue'}
							</Button>
						{:else if !secondChanceActive && index === exam.questions.length - 1 && ownPowerUps.has('second_chance') && !powerUpsUsed.includes('second_chance') && score < exam.questions.length}
							<div style="display: flex; gap: 0.5rem;">
								<Button variant="violet" class="flex-1" onclick={activateSecondChance}>
									<IconRotate size={14} stroke-width={2} /> Second chance
								</Button>
								<Button variant="ghost" class="flex-1" onclick={finish}>Finish</Button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/key}
	</div>
{/if}

<style>
	.exam-player :global(.option) {
		padding: 0.68rem 0.75rem;
		font-size: 0.86rem;
	}
	.exam-player :global(.option .letter) {
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 0.7rem;
	}
	.exam-player :global(.feedback) {
		padding: 0.7rem 0.8rem;
	}
	.exam-player :global(.progress-seg .seg) {
		height: 0.45rem;
	}
</style>
