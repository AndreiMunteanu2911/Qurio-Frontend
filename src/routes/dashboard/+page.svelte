<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { listExams } from '$lib/api';
	import { user } from '$lib/auth';
	import { pushToast } from '$lib/toasts';
	import type { Exam } from '$lib/types';

	let exams = $state<Exam[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			exams = await listExams();
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to load dashboard.', 'error');
		} finally {
			loading = false;
		}
	});

	const recent = $derived(exams.slice(0, 3));
	const questionCount = $derived(exams.reduce((total, exam) => total + exam.questions.length, 0));
</script>

{#if loading}
	<LoadingCard label="Loading your dashboard..." />
{:else}
	<section class="grid gap-8">
		<div class="flex flex-col justify-between gap-5 rounded-2xl bg-white p-8 shadow-lg md:flex-row md:items-center">
			<div>
				<p class="mb-2 font-bold text-violet-500">Dashboard</p>
				<h1 class="text-4xl font-black text-slate-900">Welcome, {$user?.email ?? 'learner'}</h1>
				<p class="mt-3 max-w-2xl text-slate-600">
					Generate a fresh exam, retake saved quizzes, and keep your practice library organized.
				</p>
			</div>
			<a
				class="pressable rounded-full border-b-emerald-700 bg-emerald-500 px-7 py-4 text-center font-black text-white shadow-lg hover:bg-emerald-600"
				href="/generate"
			>
				Generate Exam
			</a>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="rounded-2xl bg-white p-6 shadow-lg">
				<p class="font-bold text-slate-500">Saved exams</p>
				<p class="mt-3 text-4xl font-black text-slate-900">{exams.length}</p>
			</div>
			<div class="rounded-2xl bg-white p-6 shadow-lg">
				<p class="font-bold text-slate-500">Questions generated</p>
				<p class="mt-3 text-4xl font-black text-emerald-600">{questionCount}</p>
			</div>
			<div class="rounded-2xl bg-white p-6 shadow-lg">
				<p class="font-bold text-slate-500">Latest difficulty</p>
				<p class="mt-3 text-4xl font-black capitalize text-violet-600">{exams[0]?.difficulty ?? 'none'}</p>
			</div>
		</div>

		<div>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-2xl font-black text-slate-900">Recent exams</h2>
				<a class="font-bold text-violet-600 hover:text-violet-700" href="/exams">View all</a>
			</div>
			<div class="grid gap-4 md:grid-cols-3">
				{#each recent as exam}
					<a class="rounded-2xl bg-white p-6 shadow-lg hover:-translate-y-1" href={`/exam/${exam.id}`}>
						<p class="text-sm font-bold capitalize text-emerald-600">{exam.difficulty}</p>
						<h3 class="mt-2 text-xl font-black text-slate-900">{exam.title}</h3>
						<p class="mt-3 line-clamp-3 text-sm text-slate-600">{exam.prompt}</p>
					</a>
				{:else}
					<div class="rounded-2xl bg-white p-8 text-center shadow-lg md:col-span-3">
						<p class="font-semibold text-slate-600">No exams yet. Generate your first one.</p>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
