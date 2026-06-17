<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ModalWrapper from '$lib/components/ModalWrapper.svelte';
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
	let showEditName = $state(false);
	let exams = $state<Exam[]>([]);
	let results = $state<ExamResult[]>([]);
	let mistakes = $state<Mistake[]>([]);

	onMount(async () => {
		try { const [e, r, m] = await Promise.all([listExams(), listResults(), listMistakes()]); exams = e; results = r; mistakes = m; if ($user?.displayName) displayName = $user.displayName; }
		catch { /* ok */ }
		finally { loading = false; }
	});

	const questionCount = $derived(exams.reduce((t, e) => t + e.questions.length, 0));
	const avgScore = $derived(results.length > 0 ? Math.round(results.reduce((t, r) => t + r.score / r.totalQuestions, 0) / results.length * 100) : 0);
	const bestScore = $derived(results.length > 0 ? Math.max(...results.map(r => Math.round(r.score / r.totalQuestions * 100))) : 0);

	async function saveName() {
		if (!$user) return; saving = true;
		try { await updateProfile($user, { displayName }); pushToast('Display name updated.', 'success'); showEditName = false; }
		catch (error) { pushToast(error instanceof Error ? error.message : 'Failed to update name.', 'error'); }
		finally { saving = false; }
	}
	async function signOut() { await logout(); goto('/'); }
</script>

<svelte:head><title>Profile — Qurio</title></svelte:head>

{#if loading}
	<LoadingCard label="Loading profile..." />
{:else}
	<section class="page-stack">
		<div class="card-accent violet">
			<p class="eyebrow">Profile</p>
			<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">{$user?.displayName || 'Learner'}</h1>
			<p class="mt-1 text-sm" style="color: var(--text-muted);">{$user?.email}</p>
		</div>

		<div class="stat-grid">
			<div class="stat-card"><p class="value text-white">{exams.length}</p><p class="label">Exams</p></div>
			<div class="stat-card"><p class="value" style="color: var(--cyan);">{questionCount}</p><p class="label">Questions</p></div>
			<div class="stat-card"><p class="value text-white">{mistakes.length}</p><p class="label">Mistakes</p></div>
		</div>

		{#if results.length > 0}
			<div class="stat-grid">
				<div class="stat-card"><p class="value" style="color: var(--cyan);">{avgScore}%</p><p class="label">Average score</p></div>
				<div class="stat-card"><p class="value text-white">{bestScore}%</p><p class="label">Best score</p></div>
				<div class="stat-card"><p class="value text-white">{results.length}</p><p class="label">Attempts</p></div>
			</div>
		{/if}

		<div class="card-grid card-grid-2">
			<Button variant="secondary" class="w-full" onclick={() => { displayName = $user?.displayName || ''; showEditName = true; }}>Edit display name</Button>
			<Button href="/results" variant="secondary" class="w-full">Results history</Button>
			<Button variant="danger" class="w-full" onclick={signOut}>Sign out</Button>
		</div>
	</section>
{/if}

<ModalWrapper open={showEditName} title="Edit display name" onClose={() => (showEditName = false)}>
	<TextField label="Name" bind:value={displayName} />
	{#snippet footer()}
		<Button variant="secondary" class="flex-1" onclick={() => (showEditName = false)}>Cancel</Button>
		<Button class="flex-1" onclick={saveName} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
	{/snippet}
</ModalWrapper>
