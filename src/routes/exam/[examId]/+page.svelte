<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import ExamPlayer from '$lib/components/ExamPlayer.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import ModalWrapper from '$lib/components/ModalWrapper.svelte';
	import { getExam, completeExam, getProgress, saveProgress, clearProgress } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import { IconX } from '@tabler/icons-svelte';
	import type { Exam } from '$lib/types';

	let exam = $state<Exam | null>(null);
	let loading = $state(true);
	let showShare = $state(false);
	let showExitModal = $state(false);
	let xpAwarded = $state<number | null>(null);
	let newAchievements = $state<{ name: string }[]>([]);
	let showGamification = $state(false);

	let progressIndex = $state(0);
	let progressAnswers = $state<{ questionId: string; selected: number; correct: boolean }[]>([]);
	let progressScore = $state(0);
	let hasProgress = $state(false);

	const examId = $derived(page.params.examId!);
	const title = $derived(exam ? `${exam.title} — Qurio` : 'Exam — Qurio');

	onMount(async () => {
		try {
			exam = await getExam(examId);
		}
		catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to load exam.', 'error'); }
		try {
			const p = await getProgress(examId);
			if (p.hasProgress && p.currentIndex !== undefined && p.currentIndex >= 0) {
				hasProgress = true;
				progressIndex = p.currentIndex;
				progressAnswers = p.answers ?? [];
				progressScore = p.score ?? 0;
			}
		} catch { /* ok */ }
		finally { loading = false; }
	});

	async function handleDone(result: { score: number; total: number; answers: { questionId: string; selected: number; correct: boolean }[] }) {
		const e = exam;
		if (!e) return;
		try {
			const res = await completeExam({
				examId: e.id,
				examTitle: e.title,
				difficulty: e.difficulty,
				score: result.score,
				totalQuestions: result.total,
				answers: result.answers
			});
			xpAwarded = res.xp.awarded;
			newAchievements = res.newAchievements.map((a) => ({ name: a.name }));
			showGamification = true;
		} catch { pushToast('Failed to save results.', 'error'); }
		try { await clearProgress(examId); } catch { /* ok */ }
	}

	async function handleProgressChange(data: { currentIndex: number; answers: { questionId: string; selected: number; correct: boolean }[]; score: number }) {
		try {
			if (data.currentIndex < 0) {
				await clearProgress(examId);
			} else {
				await saveProgress({ examId, ...data });
			}
		} catch { /* silent */ }
	}

	function exitExam() {
		goto('/exams');
	}

	async function copyLink() {
		try { await navigator.clipboard.writeText(`${window.location.origin}/shared/${exam?.id}`); pushToast('Share link copied!', 'success'); }
		catch { pushToast('Failed to copy link.', 'error'); }
	}
</script>

<svelte:head><title>{title}</title></svelte:head>

{#if loading}
	<div style="padding: 1.125rem;"><LoadingCard label="Loading exam..." /></div>
{:else if exam}
	<div style="display: flex; flex-direction: column; height: 100dvh;">
		<div style="display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; padding-block: 0.375rem 0.5rem;">
			<Button variant="ghost" class="px-2 py-2 text-xs leading-none" onclick={() => (showExitModal = true)}>
				<IconX size={16} stroke-width={2} />
			</Button>
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
			<ExamPlayer
				{exam}
				onDone={handleDone}
				onProgressChange={handleProgressChange}
				initialIndex={hasProgress ? progressIndex : 0}
				initialAnswers={hasProgress ? progressAnswers : []}
				initialScore={hasProgress ? progressScore : 0}
			/>
		</div>

		{#if showGamification}
			<div in:fly={{ y: 8, duration: 200 }} style="flex-shrink: 0; padding-block: 0.5rem;">
				<div class="card" style="text-align: center;">
					<p class="text-sm font-black" style="color: var(--cyan);">+{xpAwarded} XP</p>
					{#each newAchievements as ach}
						<p class="mt-1 text-xs font-bold text-white">{ach.name} unlocked</p>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<ModalWrapper open={showExitModal} title="Exit exam?" onClose={() => (showExitModal = false)}>
		<p class="text-sm leading-6" style="color: var(--text-muted);">
			{hasProgress && progressAnswers.length > 0 ? 'Your progress will be saved. You can resume from where you left off.' : 'You can start the exam again from the library page.'}
		</p>
		{#snippet footer()}
			<Button variant="secondary" class="flex-1" onclick={() => (showExitModal = false)}>Cancel</Button>
			<Button variant="danger" class="flex-1" onclick={exitExam}>Exit</Button>
		{/snippet}
	</ModalWrapper>
{:else}
	<div class="card text-center py-10">
		<h1 class="text-3xl font-black text-white">Exam not found</h1>
		<a class="mt-6 inline-block font-bold" style="color: var(--cyan);" href="/exams">Return to saved exams</a>
	</div>
{/if}
