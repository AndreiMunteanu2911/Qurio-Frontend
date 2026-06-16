<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import ExamPlayer from '$lib/components/ExamPlayer.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { getExam } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Exam } from '$lib/types';

	let exam = $state<Exam | null>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			exam = await getExam(page.params.examId);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to load exam.', 'error');
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<LoadingCard label="Loading exam..." />
{:else if exam}
	<div class="mb-6">
		<a class="font-bold text-violet-600 hover:text-violet-700" href="/exams">Back to saved exams</a>
		<h1 class="mt-3 text-3xl font-black text-slate-900">{exam.title}</h1>
	</div>
	<ExamPlayer {exam} />
{:else}
	<section class="rounded-2xl bg-white p-8 text-center shadow-lg">
		<h1 class="text-3xl font-black text-slate-900">Exam not found</h1>
		<a class="mt-6 inline-block font-bold text-violet-600 hover:text-violet-700" href="/exams">
			Return to saved exams
		</a>
	</section>
{/if}
