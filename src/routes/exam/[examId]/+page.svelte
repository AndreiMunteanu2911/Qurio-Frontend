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
	<div class="mb-4 soft-card">
		<a class="text-sm font-black text-cyan-200 hover:text-white" href="/exams">Back to library</a>
		<h1 class="mt-3 text-2xl font-black leading-tight text-white">{exam.title}</h1>
	</div>
	<ExamPlayer {exam} />
{:else}
	<section class="soft-card text-center">
		<h1 class="text-3xl font-black text-white">Exam not found</h1>
		<a class="mt-6 inline-block font-black text-cyan-200 hover:text-white" href="/exams">
			Return to saved exams
		</a>
	</section>
{/if}
