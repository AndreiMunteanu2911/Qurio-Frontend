<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import type { Exam } from '$lib/types';

	let { exam, onDone = () => {} } = $props<{
		exam: Exam;
		onDone?: () => void;
	}>();

	let index = $state(0);
	let selected = $state<number | null>(null);
	let score = $state(0);
	let completed = $state(false);
	const current = $derived(exam.questions[index]);
	const isCorrect = $derived(selected === current.correctAnswerIndex);
	const progress = $derived(
		Math.round((((completed ? exam.questions.length : index) + 1) / exam.questions.length) * 100)
	);

	function choose(optionIndex: number) {
		if (selected !== null) return;
		selected = optionIndex;
		if (optionIndex === current.correctAnswerIndex) score += 1;
	}

	function next() {
		if (index === exam.questions.length - 1) {
			completed = true;
			onDone();
			return;
		}
		index += 1;
		selected = null;
	}

	function restart() {
		index = 0;
		selected = null;
		score = 0;
		completed = false;
	}
</script>

{#if completed}
	<section in:fly={{ y: 16, duration: 220 }} class="soft-card text-center">
		<p class="eyebrow">Complete</p>
		<h1 class="mt-4 text-6xl font-black text-white">{score}</h1>
		<p class="mt-1 text-sm font-black text-violet-100">out of {exam.questions.length}</p>
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
				<p class="text-xs font-black text-violet-200">Question {index + 1} / {exam.questions.length}</p>
				<p class="rounded-full bg-cyan-200/12 px-2.5 py-1 text-xs font-black capitalize text-cyan-200">{exam.difficulty}</p>
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
				<h2 class="text-2xl font-black leading-tight text-white">{current.question}</h2>

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
