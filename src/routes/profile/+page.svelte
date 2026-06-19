<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ModalWrapper from '$lib/components/ModalWrapper.svelte';
	import StreakBadge from '$lib/components/StreakBadge.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import XpBar from '$lib/components/XpBar.svelte';
	import { onDestroy } from 'svelte';
	import { getCurrency, getInventory, listExams, listResults, listMistakes } from '$lib/api';
	import { user, logout } from '$lib/auth';
	import { pushToast } from '$lib/toasts';
	import { badgeRefresh } from '$lib/refresh';
	import { firebaseAuth } from '$lib/firebase';
	import { updateProfile } from 'firebase/auth';
	import type { CurrencyData, Exam, ExamResult, InventoryData, Mistake } from '$lib/types';
	import { SHOP_ITEMS } from '$lib/shop';
	import { IconCoin, IconEdit, IconLogout, IconAward, IconChartBar, IconShoppingCart, IconPalette } from '@tabler/icons-svelte';

	let loading = $state(true);
	let displayName = $state('');
	let saving = $state(false);
	let showEditName = $state(false);
	let exams = $state<Exam[]>([]);
	let results = $state<ExamResult[]>([]);
	let mistakes = $state<Mistake[]>([]);
	let currency = $state<CurrencyData | null>(null);
	let inventory = $state<InventoryData | null>(null);
	let unsubBadge = () => {};
	onMount(async () => {
		try {
			const [e, r, m, c, i] = await Promise.all([listExams(), listResults(), listMistakes(), getCurrency(), getInventory()]);
			exams = e; results = r; mistakes = m; currency = c; inventory = i;
			if ($user?.displayName) displayName = $user.displayName;
		}
		catch { /* ok */ }
		finally { loading = false; }

		unsubBadge = badgeRefresh.subscribe(async () => {
			try {
				const [c, i] = await Promise.all([getCurrency(), getInventory()]);
				currency = c; inventory = i;
			} catch { /* ok */ }
		});
	});
	onDestroy(() => unsubBadge());

	const activeTitle = $derived(
		inventory?.activeCosmetics?.['title']
			? SHOP_ITEMS.find((s) => s.id === inventory!.activeCosmetics!['title'])?.name.replace('Title: ', '') ?? null
			: null
	);
	const activeBorder = $derived(inventory?.activeCosmetics?.['avatarBorder'] ?? null);
	const BORDER_CSS: Record<string, string> = {
		border_thin_gold: '0 0 0 2px #ffd23f, 0 0 14px rgb(255 210 63 / 0.45)',
		border_glow_violet: '0 0 0 4px #6849ff, 0 0 18px rgb(104 73 255 / 0.45)',
		border_double_ring: '0 0 0 3px #ffffff, 0 0 0 6px var(--violet), 0 0 0 9px var(--cyan)',
		border_dashed_cyan: '3px dashed var(--cyan)',
		border_starburst: '0 0 0 3px #ffd23f, 0 0 0 6px var(--violet), 0 0 24px rgb(255 210 63 / 0.38), 0 0 34px rgb(104 73 255 / 0.36)',
		border_lime_pulse: '0 0 0 4px #9be12a, 0 0 18px rgb(155 225 42 / 0.45)',
		border_inferno: '0 0 0 4px #ff5a6b, 0 0 20px rgb(255 90 107 / 0.4)',
		border_prism: '0 0 0 3px #ff3f8e, 0 0 0 6px #7dd3fc, 0 0 0 9px #b6ff2e',
		border_ice_shard: '0 0 0 3px #dff7ff, 0 0 0 6px #2f80ff, 0 0 20px rgb(47 128 255 / 0.42)',
	};

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
			<div style="display: flex; align-items: center; gap: 1rem;">
				<div
					class="avatar-ring"
					style="width: 3.5rem; height: 3.5rem; border-radius: 999px; flex-shrink: 0;
						background: var(--surface-3); display: flex; align-items: center; justify-content: center;
						font-size: 1.5rem; font-weight: 900; color: white;
						box-shadow: {activeBorder ? (BORDER_CSS[activeBorder] ?? 'none') : 'none'};
						border: none;"
				>
					{($user?.displayName || 'L')[0].toUpperCase()}
				</div>
				<div>
					<p class="eyebrow">Profile</p>
					<h1 class="mt-0.5 text-2xl font-black leading-tight text-white sm:text-3xl">{$user?.displayName || 'Learner'}</h1>
					{#if activeTitle}
						<p class="mt-0.5 text-xs font-bold" style="color: var(--accent);">{activeTitle}</p>
					{/if}
					<p class="mt-0.5 text-sm" style="color: var(--text-muted);">{$user?.email}</p>
				</div>
			</div>
		</div>

		<div class="stat-grid">
			<div class="stat-card"><p class="value text-white">{exams.length}</p><p class="label">Exams</p></div>
			<div class="stat-card"><p class="value" style="color: var(--cyan);">{questionCount}</p><p class="label">Questions</p></div>
			<div class="stat-card"><p class="value text-white">{mistakes.length}</p><p class="label">Mistakes</p></div>
		</div>

		<div class="card-sm" style="display: flex; align-items: center; justify-content: space-between;">
			<span class="flex items-center gap-1.5 text-sm font-bold" style="color: var(--text-muted);">
				<IconCoin size={16} stroke-width={2} style="color: #ffc800;" /> Coins
			</span>
			<span class="text-xl font-black" style="color: #ffc800;">{currency?.balance ?? 0}</span>
		</div>

		<div class="card" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
			<XpBar />
			<StreakBadge />
		</div>

		{#if results.length > 0}
			<div class="stat-grid">
				<div class="stat-card"><p class="value" style="color: var(--cyan);">{avgScore}%</p><p class="label">Average score</p></div>
				<div class="stat-card"><p class="value text-white">{bestScore}%</p><p class="label">Best score</p></div>
				<div class="stat-card"><p class="value text-white">{results.length}</p><p class="label">Attempts</p></div>
			</div>
		{/if}

		<div class="card-grid card-grid-2 profile-actions">
			<Button variant="secondary" class="w-full" onclick={() => { displayName = $user?.displayName || ''; showEditName = true; }}>
				<IconEdit size={14} stroke-width={2} /> Edit display name
			</Button>
			<Button href="/results" variant="secondary" class="w-full">
				<IconChartBar size={14} stroke-width={2} /> Results history
			</Button>
			<Button href="/achievements" variant="violet" class="w-full">
				<IconAward size={14} stroke-width={2} /> Achievements
			</Button>
			<Button href="/customize" variant="secondary" class="w-full">
				<IconPalette size={14} stroke-width={2} /> Customize
			</Button>
			<Button href="/shop" variant="secondary" class="w-full">
				<IconShoppingCart size={14} stroke-width={2} /> Shop
			</Button>
			<Button variant="danger" class="w-full" onclick={signOut}>
				<IconLogout size={14} stroke-width={2} /> Sign out
			</Button>
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
