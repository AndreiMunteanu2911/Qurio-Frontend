<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { getSharedExam } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Question } from '$lib/types';

	let exam = $state<{ id: string; title: string; difficulty: string; questions: Question[]; createdAt: string } | null>(null);
	let loading = $state(true);

	let index = $state(0);
	let selected = $state<number | null>(null);
	let score = $state(0);
	let completed = $state(false);

	const examId = $derived(page.params.examId!);
	const current = $derived(exam?.questions[index] ?? null);
	const isCorrect = $derived(selected === current?.correctAnswerIndex);

	onMount(async () => {
		try {
			exam = await getSharedExam(examId);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Exam not found.', 'error');
		} finally {
			loading = false;
		}
	});

	function choose(optionIndex: number) {
		if (selected !== null || !current) return;
		selected = optionIndex;
		if (optionIndex === current.correctAnswerIndex) score += 1;
	}

	function next() {
		if (!exam || index >= exam.questions.length - 1) {
			completed = true;
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

	function optionLabel(i: number) {
		return String.fromCharCode(65 + i);
	}

	function displayQuestion(text: string) {
		return text.replace(/_{3,}/g, '__________');
	}
</script>

<svelte:head>
	<title>{exam?.title ?? 'Shared Exam'} — Qurio</title>
</svelte:head>

{#if loading}
	<LoadingCard label="Loading exam..." />
{:else if !exam}
	<section class="soft-card text-center">
		<h1 class="text-3xl font-black text-white">Exam not found</h1>
		<p class="mt-3 text-sm text-violet-100/60">This exam may have been deleted or the link is invalid.</p>
		<Button class="mt-6" href="/">Go home</Button>
	</section>
{:else if completed}
	<section in:fly={{ y: 16, duration: 220 }} class="soft-card text-center">
		<p class="eyebrow">Complete</p>
		<h1 class="mt-4 text-6xl font-black text-white">{score}</h1>
		<p class="mt-1 text-sm font-black text-violet-100">out of {exam.questions.length}</p>
		<p class="mx-auto mt-5 text-sm leading-6 text-violet-100 md:text-base">
			{score >= 8 ? 'Great work!' : score >= 5 ? 'Nice effort.' : 'Keep practicing.'}
		</p>
		<div class="mt-6 grid gap-2">
			<Button onclick={restart}>Retake</Button>
			<Button href="/signup" variant="violet">Create an account</Button>
			<Button href="/" variant="secondary">Home</Button>
		</div>
	</section>
{:else}
	<section class="soft-card grid gap-5">
		<div class="flex items-center justify-between gap-3 px-1">
			<p class="text-xs font-black text-violet-200">Question {index + 1} / {exam.questions.length}</p>
			<p class="rounded-full bg-cyan-200/12 px-2.5 py-1 text-xs font-black capitalize text-cyan-200">{exam.difficulty}</p>
		</div>

		<div class="h-2 overflow-hidden rounded-full bg-white/10">
			<div
				class="h-2 rounded-full bg-[#6849ff]"
				style={`width: ${Math.round((index / exam.questions.length) * 100)}%`}
			></div>
		</div>

		<article in:fly={{ x: 24, duration: 220 }} out:fade={{ duration: 120 }} class="grid gap-6">
			<h2 class="text-2xl font-black leading-tight text-white">{displayQuestion(current!.question)}</h2>

			<div class="grid gap-3">
				{#each current!.options as option, optionIndex}
					<button
						class={[
							'pressable rounded-lg px-4 py-4 text-left text-sm font-extrabold',
							selected === null
								? 'bg-[#1b1037] text-violet-50 hover:bg-[#25164a]'
								: optionIndex === current!.correctAnswerIndex
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
					<p class="font-black">{isCorrect ? 'Correct' : 'Not quite'}</p>
					<p class="mt-2 text-sm leading-6 text-violet-50">{current!.explanation}</p>
				</div>

				<Button class="w-full" onclick={next}>
					{index >= exam.questions.length - 1 ? 'See score' : 'Next question'}
				</Button>
			{/if}
		</article>
	</section>
{/if}
