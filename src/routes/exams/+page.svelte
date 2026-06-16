<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ModalWrapper from '$lib/components/ModalWrapper.svelte';
	import ScrollArea from '$lib/components/ScrollArea.svelte';
	import { deleteExam, listExams } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Difficulty, Exam } from '$lib/types';

	let exams = $state<Exam[]>([]);
	let loading = $state(true);
	let query = $state('');
	let difficulty = $state<Difficulty | 'all'>('all');
	let examToDelete = $state<Exam | null>(null);

	onMount(async () => {
		await load();
	});

	async function load() {
		loading = true;
		try {
			exams = await listExams();
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to load exams.', 'error');
		} finally {
			loading = false;
		}
	}

	async function remove() {
		if (!examToDelete) return;
		try {
			await deleteExam(examToDelete.id);
			exams = exams.filter((exam) => exam.id !== examToDelete?.id);
			examToDelete = null;
			pushToast('Exam deleted.', 'success');
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to delete exam.', 'error');
		}
	}

	const filtered = $derived(
		exams.filter((exam) => {
			const matchesQuery = `${exam.title} ${exam.prompt}`.toLowerCase().includes(query.toLowerCase());
			const matchesDifficulty = difficulty === 'all' || exam.difficulty === difficulty;
			return matchesQuery && matchesDifficulty;
		})
	);
</script>

{#if loading}
	<LoadingCard label="Loading saved exams..." />
{:else}
	<section class="page-stack">
		<div class="section-header">
			<p class="eyebrow">Library</p>
			<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Saved exams</h1>
			<p class="mt-3 text-base leading-7 text-violet-100/72">
				Find a quiz, retake it, or clear old practice sets.
			</p>
		</div>

		<div class="soft-card grid gap-3">
			<h2 class="text-lg font-black text-white">Filters</h2>
			<input class="field" placeholder="Search exams..." bind:value={query} />
			<select class="field font-bold" bind:value={difficulty}>
				<option value="all">All difficulties</option>
				<option value="easy">Easy</option>
				<option value="medium">Medium</option>
				<option value="hard">Hard</option>
			</select>
		</div>

		<div class="soft-card">
			<div class="mb-4 flex items-center justify-between gap-3">
				<h2 class="text-xl font-black text-white">Practice sets</h2>
				<p class="text-sm font-bold text-violet-100/65">{filtered.length} shown</p>
			</div>

			<ScrollArea maxHeight="none">
				<div class="grid gap-3">
					{#each filtered as exam}
						<div class="soft-panel grid gap-4 p-4">
							<div>
								<div class="flex items-start justify-between gap-3">
									<h2 class="min-w-0 text-lg font-black leading-snug text-white">{exam.title}</h2>
									<p class="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-bold capitalize text-[#12072d]">{exam.difficulty}</p>
								</div>
								<p class="mt-2 line-clamp-2 text-sm leading-6 text-violet-100/76">{exam.prompt}</p>
								<p class="mt-3 text-xs font-bold text-violet-200/70">
									{new Date(exam.createdAt).toLocaleDateString()} - 10 questions
								</p>
							</div>
							<div class="grid gap-2 sm:grid-cols-[1fr_auto]">
								<Button href={`/exam/${exam.id}`} class="py-3">Retake</Button>
								<Button variant="danger" onclick={() => (examToDelete = exam)}>Delete</Button>
							</div>
						</div>
					{:else}
						<div class="soft-panel p-10 text-center">
							<p class="font-semibold text-violet-100">No exams match your filters.</p>
						</div>
					{/each}
				</div>
			</ScrollArea>
		</div>
	</section>
{/if}

<ModalWrapper
	open={examToDelete !== null}
	title="Delete exam?"
	description="This removes the saved quiz from your library. You cannot undo this action."
	onClose={() => (examToDelete = null)}
>
	<p class="rounded-lg bg-[#1b1037] p-4 text-sm font-bold text-violet-100">{examToDelete?.title}</p>

	{#snippet footer()}
		<Button variant="secondary" class="flex-1" onclick={() => (examToDelete = null)}>
			Cancel
		</Button>
		<Button variant="danger" class="flex-1" onclick={remove}>
			Delete
		</Button>
	{/snippet}
</ModalWrapper>
