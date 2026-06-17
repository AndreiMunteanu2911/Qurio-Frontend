<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { listExams, listMistakes } from '$lib/api';
	import { user } from '$lib/auth';
	import { pushToast } from '$lib/toasts';
	import type { Exam } from '$lib/types';

	let exams = $state<Exam[]>([]);
	let mistakeCount = $state(0);
	let loading = $state(true);

	onMount(async () => {
		try { const [e, m] = await Promise.all([listExams(), listMistakes()]); exams = e; mistakeCount = m.length; }
		catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to load dashboard.', 'error'); }
		finally { loading = false; }
	});

	const recent = $derived(exams.slice(0, 6));
	const questionCount = $derived(exams.reduce((total, exam) => total + exam.questions.length, 0));
	const firstName = $derived(($user?.email ?? 'learner').split('@')[0]);
</script>

<svelte:head><title>Dashboard — Qurio</title></svelte:head>

{#if loading}
	<LoadingCard label="Loading your dashboard..." />
{:else}
	<section class="page-stack">
		<div class="card-accent violet">
			<p class="eyebrow">Dashboard</p>
			<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">Ready, {firstName}?</h1>
			<p class="mt-1.5 text-sm leading-6" style="color: var(--text-muted); max-width: 400px;">
				Create a fresh exam or revisit your latest practice set.
			</p>
		</div>

		<div class="stat-grid">
			<div class="stat-card"><p class="value text-white">{exams.length}</p><p class="label">Exams</p></div>
			<div class="stat-card"><p class="value" style="color: var(--cyan);">{questionCount}</p><p class="label">Questions</p></div>
			<div class="stat-card"><p class="value capitalize text-white">{exams[0]?.difficulty ?? '-'}</p><p class="label">Latest difficulty</p></div>
		</div>

		<div class="card-grid card-grid-2">
			<Button href="/generate" class="w-full" style="padding-block: 0.75rem;">Create exam</Button>
			<Button href="/results" variant="secondary" class="w-full" style="padding-block: 0.75rem;">Results history</Button>
			<Button href="/mistakes" variant="violet" class="w-full" style="padding-block: 0.75rem;">Review mistakes ({mistakeCount})</Button>
		</div>

		<div class="card">
			<div class="mb-3 flex items-center justify-between gap-3">
				<h2 class="text-lg font-black text-white">Recent practice</h2>
				<a class="text-xs font-bold" style="color: var(--cyan);" href="/exams">See all</a>
			</div>
			<div class="grid gap-1.5 sm:grid-cols-2">
				{#each recent as exam}
					<a class="option cursor-pointer" href={`/exam/${exam.id}`}>
						<div class="flex w-full items-center justify-between gap-3">
							<div class="min-w-0">
								<h3 class="text-sm font-black leading-snug text-white">{exam.title}</h3>
								<p class="mt-0.5 text-xs font-bold" style="color: var(--text-muted);">{exam.questions.length} questions</p>
							</div>
							<p class="tag tag-violet shrink-0">{exam.difficulty}</p>
						</div>
					</a>
				{:else}
					<div class="col-span-full py-6 text-center">
						<p class="text-sm font-bold" style="color: var(--text-muted);">No exams yet. Create your first practice set.</p>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
