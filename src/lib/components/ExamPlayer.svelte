<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import type { Exam, Question } from '$lib/types';

	const TOTAL_MINUTES = 10;

	let {
		exam,
		mistakeIds = [],
		onDone = () => {}
	} = $props<{
		exam: Exam;
		mistakeIds?: string[];
		onDone?: (result: { score: number; total: number; answers: { questionId: string; selected: number; correct: boolean }[]; mistakes: { question: Question }[] }) => void;
	}>();

	let index = $state(0);
	let selected = $state<number | null>(null);
	let score = $state(0);
	let completed = $state(false);
	let timeLeft = $state(TOTAL_MINUTES * 60);
	let timerActive = $state(true);
	let answers = $state<{ questionId: string; selected: number; correct: boolean }[]>([]);
	let newMistakes = $state<{ question: Question }[]>([]);

	const current = $derived(exam.questions[index]);
	const isCorrect = $derived(selected === current.correctAnswerIndex);
	const progress = $derived(
		Math.round((((completed ? exam.questions.length : index)) / exam.questions.length) * 100)
	);
	const minutes = $derived(Math.floor(timeLeft / 60));
	const seconds = $derived(timeLeft % 60);
	const timerClass = $derived(timeLeft <= 30 ? 'text-rose-300' : 'text-violet-200');

	let timerInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		timerInterval = setInterval(() => {
			if (!timerActive || completed) return;
			timeLeft -= 1;
			if (timeLeft <= 0) {
				timeLeft = 0;
				timerActive = false;
				finish();
			}
		}, 1000);

		return () => {
			if (timerInterval) clearInterval(timerInterval);
		};
	});

	function choose(optionIndex: number) {
		if (selected !== null) return;
		selected = optionIndex;
		timerActive = false;

		const correct = optionIndex === current.correctAnswerIndex;
		if (correct) {
			score += 1;
		} else {
			if (!mistakeIds.includes(current.id)) {
				newMistakes.push({ question: current });
			}
		}
		answers.push({ questionId: current.id, selected: optionIndex, correct });
	}

	function next() {
		if (index === exam.questions.length - 1) {
			finish();
			return;
		}
		index += 1;
		selected = null;
		timerActive = true;
	}

	function finish() {
		completed = true;
		if (timerInterval) clearInterval(timerInterval);
		onDone({
			score,
			total: exam.questions.length,
			answers,
			mistakes: newMistakes
		});
	}

	function restart() {
		index = 0;
		selected = null;
		score = 0;
		completed = false;
		timeLeft = TOTAL_MINUTES * 60;
		timerActive = true;
		answers = [];
		newMistakes = [];
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			if (!timerActive || completed) return;
			timeLeft -= 1;
			if (timeLeft <= 0) {
				timeLeft = 0;
				timerActive = false;
				finish();
			}
		}, 1000);
	}

	function questionLabel(q: Question, i: number) {
		if (q.type === 'true-false') return `Question ${i + 1} (True / False)`;
		if (q.type === 'fill-blank') return `Question ${i + 1} (Fill the blank)`;
		return `Question ${i + 1}`;
	}

	function displayQuestion(text: string) {
		return text.replace(/_{3,}/g, '__________');
	}

	function optionLabel(optionIndex: number) {
		return String.fromCharCode(65 + optionIndex);
	}
</script>

{#if completed}
	<section in:fly={{ y: 16, duration: 220 }} class="soft-card text-center">
		<p class="eyebrow">Complete</p>
		<h1 class="mt-4 text-6xl font-black text-white">{score}</h1>
		<p class="mt-1 text-sm font-black text-violet-100">out of {exam.questions.length}</p>
		{#if timeLeft <= 0 && !answers.length}
			<p class="mt-3 text-sm font-bold text-rose-300">Time's up!</p>
		{/if}
		<p class="mx-auto mt-5 text-sm leading-6 text-violet-100 md:text-base">
			{score >= 8
				? 'Excellent command of the material.'
				: score >= 5
					? 'Solid progress. A retake will sharpen the edges.'
					: 'Keep practicing. Each pass makes the pattern clearer.'}
		</p>
		<div class="mt-6 grid gap-2">
			<Button onclick={restart}>Retake exam</Button>
			<Button href="/generate" variant="violet">Create new exam</Button>
			<Button href="/dashboard" variant="secondary">Dashboard</Button>
		</div>
	</section>
{:else}
	<section class="soft-card grid gap-5">
		<div>
			<div class="mb-3 flex items-center justify-between gap-3 px-1">
				<p class="text-xs font-black text-violet-200">{questionLabel(current, index)}</p>
				<div class="flex items-center gap-3">
					<p class="rounded-full bg-cyan-200/12 px-2.5 py-1 text-xs font-black capitalize text-cyan-200">{exam.difficulty}</p>
					<p class="text-xs font-black {timerClass}">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
				</div>
			</div>
			<div class="h-2 overflow-hidden rounded-full bg-white/10">
				<div
					class="h-2 rounded-full bg-[#6849ff]"
					style={`width: ${progress}%`}
				></div>
			</div>
		</div>

		{#key index}
			<article in:fly={{ x: 24, duration: 220 }} out:fade={{ duration: 120 }} class="grid gap-6">
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
							isCorrect ? 'border-cyan-200/60 bg-cyan-400/15' : 'border-rose-200/60 bg-rose-500/15'
						]}
					>
						<p class={['font-black', isCorrect ? 'text-cyan-100' : 'text-rose-100']}>
							{isCorrect ? 'Correct' : 'Not quite'}
						</p>
						<p class="mt-2 text-sm leading-6 text-violet-50">{current.explanation}</p>
					</div>

					<Button class="w-full" onclick={next}>
						{index === exam.questions.length - 1 ? 'See score' : 'Next question'}
					</Button>
				{/if}
			</article>
		{/key}
	</section>
{/if}
