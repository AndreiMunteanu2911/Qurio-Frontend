<script lang="ts">
	import { fade, fly } from 'svelte/transition';
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
		Math.round(((completed ? exam.questions.length : index) / exam.questions.length) * 100)
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
	<section
		in:fly={{ y: 16, duration: 220 }}
		class="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-lg"
	>
		<p class="mb-3 text-sm font-bold uppercase text-violet-500">Exam complete</p>
		<h1 class="text-4xl font-black text-slate-900">{score} / {exam.questions.length}</h1>
		<p class="mt-4 text-lg text-slate-600">
			{score >= 8
				? 'Excellent command of the material.'
				: score >= 5
					? 'Solid progress. A retake will sharpen the edges.'
					: 'Keep practicing. Each pass makes the pattern clearer.'}
		</p>
		<div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
			<button
				class="pressable rounded-full border-b-emerald-700 bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg hover:bg-emerald-600"
				onclick={restart}
			>
				Retake exam
			</button>
			<a
				class="pressable rounded-full border-b-violet-700 bg-violet-500 px-6 py-3 text-center font-bold text-white shadow-lg hover:bg-violet-600"
				href="/dashboard"
			>
				Dashboard
			</a>
			<a
				class="pressable rounded-full border-b-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-700 shadow-lg hover:bg-slate-100"
				href="/generate"
			>
				New exam
			</a>
		</div>
	</section>
{:else}
	<section class="mx-auto max-w-4xl">
		<div class="mb-6 rounded-full bg-white p-2 shadow-lg">
			<div class="h-3 rounded-full bg-slate-100">
				<div class="h-3 rounded-full bg-emerald-500" style={`width: ${progress}%`}></div>
			</div>
		</div>

		{#key index}
			<article
				in:fly={{ x: 28, duration: 220 }}
				out:fade={{ duration: 120 }}
				class="rounded-2xl bg-white p-6 shadow-lg sm:p-8"
			>
				<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
					<p class="rounded-full bg-violet-50 px-4 py-2 text-sm font-bold text-violet-600">
						Question {index + 1} of {exam.questions.length}
					</p>
					<p class="text-sm font-semibold capitalize text-slate-500">{exam.difficulty}</p>
				</div>

				<h2 class="text-xl font-semibold leading-relaxed text-slate-800 sm:text-2xl">
					{current.question}
				</h2>

				<div class="mt-8 grid gap-3">
					{#each current.options as option, optionIndex}
						<button
							class={[
								'pressable rounded-2xl border px-5 py-4 text-left font-semibold shadow-lg',
								selected === null
									? 'border-slate-200 border-b-slate-300 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50'
									: optionIndex === current.correctAnswerIndex
										? 'border-emerald-200 border-b-emerald-700 bg-emerald-500 text-white'
										: selected === optionIndex
											? 'border-rose-200 border-b-rose-700 bg-rose-500 text-white'
											: 'border-slate-100 border-b-slate-200 bg-slate-50 text-slate-400'
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
							'mt-6 rounded-2xl border p-5',
							isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
						]}
					>
						<p class={['text-lg font-black', isCorrect ? 'text-emerald-700' : 'text-rose-700']}>
							{isCorrect ? 'Correct' : 'Not quite'}
						</p>
						<p class="mt-2 text-slate-700">{current.explanation}</p>
					</div>

					<div class="mt-6 flex justify-end">
						<button
							class="pressable rounded-full border-b-emerald-700 bg-emerald-500 px-7 py-3 font-bold text-white shadow-lg hover:bg-emerald-600"
							onclick={next}
						>
							{index === exam.questions.length - 1 ? 'See score' : 'Next'}
						</button>
					</div>
				{/if}
			</article>
		{/key}
	</section>
{/if}
