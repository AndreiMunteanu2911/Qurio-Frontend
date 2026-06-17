<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ModalWrapper from '$lib/components/ModalWrapper.svelte';
	import Select from '$lib/components/Select.svelte';
	import { deleteExam, listExams } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Difficulty, Exam } from '$lib/types';

	let exams = $state<Exam[]>([]);
	let loading = $state(true);
	let query = $state('');
	let difficulty = $state<Difficulty | 'all'>('all');
	let examToDelete = $state<Exam | null>(null);

	onMount(async () => { await load(); });

	async function load() {
		loading = true;
		try { exams = await listExams(); }
		catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to load exams.', 'error'); }
		finally { loading = false; }
	}

	async function remove() {
		if (!examToDelete) return;
		try {
			await deleteExam(examToDelete.id);
			exams = exams.filter(e => e.id !== examToDelete?.id);
			examToDelete = null;
			pushToast('Exam deleted.', 'success');
		} catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to delete exam.', 'error'); }
	}

	const filtered = $derived(
		exams.filter(e =>
			`${e.title} ${e.prompt}`.toLowerCase().includes(query.toLowerCase()) &&
			(difficulty === 'all' || e.difficulty === difficulty)
		)
	);
</script>

<svelte:head><title>Saved Exams — Qurio</title></svelte:head>

{#if loading}
	<LoadingCard label="Loading saved exams..." />
{:else}
	<section class="page-stack">
		<div class="card-accent cyan">
			<p class="eyebrow">Library</p>
			<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">Saved exams</h1>
			<p class="mt-1.5 text-sm leading-6" style="color: var(--text-muted); max-width: 440px;">
				Find a quiz, retake it, or clear old practice sets.
			</p>
		</div>

		<div class="card-grid card-grid-2" style="align-items: start;">
			<div class="card">
				<h2 class="mb-2 text-sm font-black text-white">Filters</h2>
				<input class="field" placeholder="Search exams..." bind:value={query} />
				<Select bind:value={difficulty} options={['all', 'easy', 'medium', 'hard']} label="All difficulties" />
			</div>

			<div class="card" style="max-height: 65vh;">
				<div class="mb-3 flex items-center justify-between gap-3">
					<h2 class="text-lg font-black text-white">Practice sets</h2>
					<p class="text-xs font-bold" style="color: var(--text-muted);">{filtered.length} shown</p>
				</div>

				<div class="grid gap-1.5" style="overflow-y: auto; max-height: calc(65vh - 3.5rem); scrollbar-width: thin; scrollbar-color: var(--violet) transparent;">
					{#each filtered as exam}
						<div class="option cursor-default">
							<div class="grid w-full gap-2">
								<a href={`/exam/${exam.id}`} class="grid gap-1">
									<div class="flex items-start justify-between gap-2">
										<h3 class="min-w-0 text-sm font-black leading-snug text-white">{exam.title}</h3>
										<p class="tag tag-violet shrink-0">{exam.difficulty}</p>
									</div>
									<p class="line-clamp-2 text-xs leading-5" style="color: var(--text-muted);">{exam.prompt}</p>
									<p class="text-xs font-bold" style="color: var(--text-muted);">
										{new Date(exam.createdAt).toLocaleDateString()} — 10 questions
									</p>
								</a>
								<div class="flex gap-2">
									<Button href={`/exam/${exam.id}`} class="flex-1 py-2 text-xs">Continue</Button>
									<Button variant="danger" class="py-2 text-xs" onclick={() => (examToDelete = exam)}>Delete</Button>
								</div>
							</div>
						</div>
					{:else}
						<div class="py-6 text-center">
							<p class="text-sm font-bold" style="color: var(--text-muted);">No exams match your filters.</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}

<ModalWrapper open={examToDelete !== null} title="Delete exam?" description="This removes the saved quiz from your library. You cannot undo this action." onClose={() => (examToDelete = null)}>
	<p class="rounded-lg p-3 text-sm font-bold" style="background: var(--surface-2); color: var(--text-muted);">{examToDelete?.title}</p>
	{#snippet footer()}
		<Button variant="secondary" class="flex-1" onclick={() => (examToDelete = null)}>Cancel</Button>
		<Button variant="danger" class="flex-1" onclick={remove}>Delete</Button>
	{/snippet}
</ModalWrapper>
