<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ScrollArea from '$lib/components/ScrollArea.svelte';
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

	const recent = $derived(exams.slice(0, 5));
	const questionCount = $derived(exams.reduce((total, exam) => total + exam.questions.length, 0));
	const firstName = $derived(($user?.email ?? 'learner').split('@')[0]);
</script>

<svelte:head>
	<title>Dashboard — Qurio</title>
</svelte:head>

{#if loading}
	<LoadingCard label="Loading your dashboard..." />
{:else}
	<section class="page-stack">
		<div class="section-header">
			<p class="eyebrow">Dashboard</p>
			<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
				Ready, {firstName}?
			</h1>
			<p class="mt-3 text-base leading-7 text-violet-100/72">
				Create a fresh exam or revisit your latest practice set.
			</p>
		</div>

		<div class="soft-card grid gap-4">
			<div class="responsive-stack">
				<div class="stat-card">
					<p class="text-3xl font-black text-white">{exams.length}</p>
					<p class="mt-1 text-xs font-bold text-violet-100/70">Exams</p>
				</div>
				<div class="stat-card">
					<p class="text-3xl font-black text-cyan-200">{questionCount}</p>
					<p class="mt-1 text-xs font-bold text-violet-100/70">Questions</p>
				</div>
				<div class="stat-card">
					<p class="text-3xl font-black capitalize text-white">{exams[0]?.difficulty ?? '-'}</p>
					<p class="mt-1 text-xs font-bold text-violet-100/70">Latest</p>
				</div>
			</div>
			<Button href="/generate">Create exam</Button>
		</div>

		<div class="soft-card">
			<div class="mb-4 flex items-center justify-between gap-3">
				<h2 class="text-xl font-black text-white">Recent practice</h2>
				<a class="text-sm font-black text-cyan-200" href="/exams">All</a>
			</div>

			<ScrollArea maxHeight="none">
				<div class="grid gap-3">
					{#each recent as exam}
						<a class="surface-link p-4" href={`/exam/${exam.id}`}>
							<div class="grid gap-2">
								<div class="flex items-start justify-between gap-3">
									<h3 class="min-w-0 text-lg font-black leading-snug text-white">{exam.title}</h3>
									<p class="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-bold capitalize text-[#12072d]">{exam.difficulty}</p>
								</div>
								<p class="line-clamp-2 text-sm leading-6 text-violet-100/72">{exam.prompt}</p>
							</div>
						</a>
					{:else}
						<div class="soft-panel p-8 text-center">
							<p class="font-semibold text-violet-100">No exams yet. Create your first practice set.</p>
						</div>
					{/each}
				</div>
			</ScrollArea>
		</div>
	</section>
{/if}
