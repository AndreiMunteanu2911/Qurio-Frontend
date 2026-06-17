<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import { listExams, listResults, listMistakes } from '$lib/api';
	import { user, logout } from '$lib/auth';
	import { pushToast } from '$lib/toasts';
	import { firebaseAuth } from '$lib/firebase';
	import { updateProfile } from 'firebase/auth';
	import type { Exam, ExamResult, Mistake } from '$lib/types';

	let loading = $state(true);
	let displayName = $state('');
	let saving = $state(false);
	let exams = $state<Exam[]>([]);
	let results = $state<ExamResult[]>([]);
	let mistakes = $state<Mistake[]>([]);

	onMount(async () => {
		try {
			const [e, r, m] = await Promise.all([listExams(), listResults(), listMistakes()]);
			exams = e;
			results = r;
			mistakes = m;
			if ($user?.displayName) displayName = $user.displayName;
		} catch {
			// partial data ok
		} finally {
			loading = false;
		}
	});

	const questionCount = $derived(exams.reduce((t, e) => t + e.questions.length, 0));
	const avgScore = $derived(
		results.length > 0
			? Math.round(results.reduce((t, r) => t + r.score / r.totalQuestions, 0) / results.length * 100)
			: 0
	);
	const bestScore = $derived(
		results.length > 0
			? Math.max(...results.map((r) => Math.round(r.score / r.totalQuestions * 100)))
			: 0
	);

	async function saveName() {
		if (!$user) return;
		saving = true;
		try {
			await updateProfile($user, { displayName });
			pushToast('Display name updated.', 'success');
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Failed to update name.', 'error');
		} finally {
			saving = false;
		}
	}

	async function signOut() {
		await logout();
		goto('/');
	}
</script>

<svelte:head>
	<title>Profile — Qurio</title>
</svelte:head>

{#if loading}
	<LoadingCard label="Loading profile..." />
{:else}
	<section class="page-stack">
		<div class="section-header">
			<p class="eyebrow">Profile</p>
			<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
				{$user?.displayName || 'Learner'}
			</h1>
			<p class="mt-3 text-base leading-7 text-violet-100/72">
				{$user?.email}
			</p>
		</div>

		<div in:fly={{ y: 12, duration: 200 }}>
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
						<p class="text-3xl font-black text-white">{mistakes.length}</p>
						<p class="mt-1 text-xs font-bold text-violet-100/70">Mistakes</p>
					</div>
				</div>

				{#if results.length > 0}
					<div class="responsive-stack">
						<div class="stat-card">
							<p class="text-3xl font-black text-cyan-200">{avgScore}%</p>
							<p class="mt-1 text-xs font-bold text-violet-100/70">Avg. score</p>
						</div>
						<div class="stat-card">
							<p class="text-3xl font-black text-white">{bestScore}%</p>
							<p class="mt-1 text-xs font-bold text-violet-100/70">Best score</p>
						</div>
						<div class="stat-card">
							<p class="text-3xl font-black text-white">{results.length}</p>
							<p class="mt-1 text-xs font-bold text-violet-100/70">Attempts</p>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div class="soft-card grid gap-4">
			<h2 class="text-lg font-black text-white">Display name</h2>
			<TextField label="Name" bind:value={displayName} />
			<Button onclick={saveName} disabled={saving}>
				{saving ? 'Saving...' : 'Save'}
			</Button>
		</div>

		<div class="soft-card grid gap-3">
			<Button href="/mistakes" variant="violet" class="w-full">Review mistakes ({mistakes.length})</Button>
			<Button href="/results" variant="secondary" class="w-full">Results history</Button>
			<Button variant="danger" class="w-full" onclick={signOut}>Sign out</Button>
		</div>
	</section>
{/if}
