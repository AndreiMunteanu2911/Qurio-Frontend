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
		try { exam = await getExam(examId); }
		catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to load exam.', 'error'); }
		finally { loading = false; }
	});

	async function handleDone(result: { score: number; total: number; answers: { questionId: string; selected: number; correct: boolean }[]; mistakes: { question: import('$lib/types').Question }[] }) {
		const e = exam;
		if (!e) return;
		try {
			await saveResult({ examId: e.id, examTitle: e.title, difficulty: e.difficulty, score: result.score, totalQuestions: result.total, answers: result.answers });
			if (result.mistakes.length > 0) {
				await addMistakes(result.mistakes.map(m => ({ examId: e.id, examTitle: e.title, difficulty: e.difficulty, question: m.question })));
			}
		} catch { pushToast('Failed to save results.', 'error'); }
	}

	async function copyLink() {
		try { await navigator.clipboard.writeText(`${window.location.origin}/shared/${exam?.id}`); pushToast('Share link copied!', 'success'); }
		catch { pushToast('Failed to copy link.', 'error'); }
	}
</script>

<svelte:head><title>{title}</title></svelte:head>

{#if loading}
	<LoadingCard label="Loading exam..." />
{:else if exam}
	<div style="display: flex; flex-direction: column; height: 100dvh;">
		<!-- Top bar: back + share, aligned center -->
		<div style="display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; padding-block: 0.375rem 0.5rem;">
			<a class="text-sm font-bold leading-none" style="color: var(--cyan); padding: 0.25rem 0;" href="/exams">Back</a>
			<div class="relative" style="line-height: 1;">
				<Button variant="ghost" class="px-3 py-2 text-xs leading-none" onclick={() => (showShare = !showShare)}>Share</Button>
				{#if showShare}
					<div class="absolute right-0 top-full z-50 mt-2 rounded-xl border p-4 shadow-xl" style="width: 18rem; background: var(--surface); border-color: var(--border);">
						<p class="text-xs font-bold" style="color: var(--text-muted);">Share this exam</p>
						<p class="mt-1 text-xs" style="color: var(--text-muted);">Anyone with the link can take it. No account needed.</p>
						<Button class="mt-3 w-full" onclick={copyLink}>Copy link</Button>
						<Button variant="ghost" class="mt-1 w-full" onclick={() => (showShare = false)}>Close</Button>
					</div>
				{/if}
			</div>
		</div>
		<div style="flex: 1; min-height: 0;">
			<ExamPlayer {exam} onDone={handleDone} />
		</div>
	</div>
{:else}
	<div class="card text-center py-10">
		<h1 class="text-3xl font-black text-white">Exam not found</h1>
		<a class="mt-6 inline-block font-bold" style="color: var(--cyan);" href="/exams">Return to saved exams</a>
	</div>
{/if}
