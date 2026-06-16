<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { deleteExam, listExams } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Difficulty, Exam } from '$lib/types';

	let exams = $state<Exam[]>([]);
	let loading = $state(true);
	let query = $state('');
	let difficulty = $state<Difficulty | 'all'>('all');

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

	async function remove(examId: string) {
		try {
			await deleteExam(examId);
			exams = exams.filter((exam) => exam.id !== examId);
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
	<section class="grid gap-6">
		<div class="rounded-2xl bg-white p-8 shadow-lg">
			<h1 class="text-4xl font-black text-slate-900">Saved Exams</h1>
			<p class="mt-3 text-slate-600">Search, filter, retake, or delete your previous exams.</p>
			<div class="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
				<input
					class="rounded-2xl border-slate-200 px-4 py-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
					placeholder="Search exams..."
					bind:value={query}
				/>
				<select
					class="rounded-2xl border-slate-200 px-4 py-3 font-semibold shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
					bind:value={difficulty}
				>
					<option value="all">All difficulties</option>
					<option value="easy">Easy</option>
					<option value="medium">Medium</option>
					<option value="hard">Hard</option>
				</select>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each filtered as exam}
				<article class="rounded-2xl bg-white p-6 shadow-lg">
					<p class="text-sm font-bold capitalize text-emerald-600">{exam.difficulty}</p>
					<h2 class="mt-2 text-xl font-black text-slate-900">{exam.title}</h2>
					<p class="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{exam.prompt}</p>
					<p class="mt-4 text-xs font-semibold text-slate-400">
						{new Date(exam.createdAt).toLocaleDateString()}
					</p>
					<div class="mt-5 flex gap-2">
						<a
							class="pressable flex-1 rounded-full border-b-emerald-700 bg-emerald-500 px-4 py-3 text-center font-bold text-white shadow-lg hover:bg-emerald-600"
							href={`/exam/${exam.id}`}
						>
							Retake
						</a>
						<button
							class="pressable rounded-full border-b-rose-700 bg-rose-500 px-4 py-3 font-bold text-white shadow-lg hover:bg-rose-600"
							onclick={() => remove(exam.id)}
						>
							Delete
						</button>
					</div>
				</article>
			{:else}
				<div class="rounded-2xl bg-white p-8 text-center shadow-lg md:col-span-2 xl:col-span-3">
					<p class="font-semibold text-slate-600">No exams match your filters.</p>
				</div>
			{/each}
		</div>
	</section>
{/if}
