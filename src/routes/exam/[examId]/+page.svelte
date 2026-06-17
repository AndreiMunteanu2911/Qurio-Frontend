<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import ExamPlayer from '$lib/components/ExamPlayer.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { getExam, saveResult, addMistakes } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Exam } from '$lib/types';

	let exam = $state<Exam | null>(null);
	let loading = $state(true);
	let showShare = $state(false);

	const examId = $derived(page.params.examId!);
	const title = $derived(exam ? `${exam.title} — Qurio` : 'Exam — Qurio');

	onMount(async () => {
		try {
			exam = await getExam(examId);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to load exam.', 'error');
		} finally {
			loading = false;
		}
	});

	async function handleDone(result: { score: number; total: number; answers: { questionId: string; selected: number; correct: boolean }[]; mistakes: { question: import('$lib/types').Question }[] }) {
		const e = exam;
		if (!e) return;

		try {
			await saveResult({
				examId: e.id,
				examTitle: e.title,
				difficulty: e.difficulty,
				score: result.score,
				totalQuestions: result.total,
				answers: result.answers
			});

			if (result.mistakes.length > 0) {
				await addMistakes(
					result.mistakes.map((m) => ({
						examId: e.id,
						examTitle: e.title,
						difficulty: e.difficulty,
						question: m.question
					}))
				);
			}
		} catch (error) {
			pushToast('Failed to save results.', 'error');
		}
	}

	async function copyLink() {
		const url = `${window.location.origin}/shared/${exam?.id}`;
		try {
			await navigator.clipboard.writeText(url);
			pushToast('Share link copied!', 'success');
		} catch {
			pushToast('Failed to copy link.', 'error');
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#if loading}
	<LoadingCard label="Loading exam..." />
{:else if exam}
	<div class="mb-4 flex items-start justify-between gap-3 soft-card">
		<div>
			<a class="text-sm font-black text-cyan-200 hover:text-white" href="/exams">Back to library</a>
			<h1 class="mt-3 text-2xl font-black leading-tight text-white">{exam.title}</h1>
		</div>
		<div class="relative shrink-0">
			<Button variant="ghost" class="px-3 py-2 text-xs" onclick={() => (showShare = !showShare)}>
				Share
			</Button>
			{#if showShare}
				<div class="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-white/10 bg-[#130a2b] p-4 shadow-xl">
					<p class="text-xs font-bold text-violet-200">Share this exam</p>
					<p class="mt-1 text-xs text-violet-100/60">Anyone with the link can take it. No account needed.</p>
					<Button class="mt-3 w-full" onclick={copyLink}>Copy link</Button>
					<Button variant="ghost" class="mt-1 w-full" onclick={() => (showShare = false)}>Close</Button>
				</div>
			{/if}
		</div>
	</div>
	<ExamPlayer {exam} onDone={handleDone} />
{:else}
	<section class="soft-card text-center">
		<h1 class="text-3xl font-black text-white">Exam not found</h1>
		<a class="mt-6 inline-block font-black text-cyan-200 hover:text-white" href="/exams">
			Return to saved exams
		</a>
	</section>
{/if}
