<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import DailyLoginModal from '$lib/components/DailyLoginModal.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import StreakBadge from '$lib/components/StreakBadge.svelte';
	import XpBar from '$lib/components/XpBar.svelte';
	import { claimLogin, claimQuest, getDaily, listExams, listMistakes, listProgress, listResults } from '$lib/api';
	import { user } from '$lib/auth';
	import { badgeRefresh } from '$lib/refresh';
	import { pushToast } from '$lib/toasts';
	import type { DailyData, Exam, ExamResult } from '$lib/types';
	import { IconCoin, IconPlus, IconChartBar, IconAlertTriangle, IconCheck, IconRotate } from '@tabler/icons-svelte';

	let exams = $state<Exam[]>([]);
	let results = $state<ExamResult[]>([]);
	let progressExamIds = $state<string[]>([]);
	let mistakeCount = $state(0);
	let loading = $state(true);

	// Daily features
	let dailyData = $state<DailyData | null>(null);
	let showLoginModal = $state(false);
	let loginCoins = $state(0);
	let loginStreak = $state(1);
	let claimingLogin = $state(false);

	// Quest
	let questClaiming = $state(false);

	onMount(async () => {
		try {
			const [e, r, m] = await Promise.all([listExams(), listResults(), listMistakes()]);
			exams = e; results = r; mistakeCount = m.length;
		} catch { /* ok */ }
		try {
			const p = await listProgress();
			progressExamIds = p.examIds;
		} catch { /* ok */ }

		// Load daily data
		try {
			const dd = await getDaily();
			dailyData = dd;

			if (dd.canClaimLogin) {
				loginStreak = dd.loginStreak || 1;
				loginCoins = 5 + (dd.loginStreak > 1 ? 1 : 0);
				showLoginModal = true;
			}

		} catch { /* ok */ }

		finally { loading = false; }
	});

	const inProgress = $derived(new Set(progressExamIds));
	const recent = $derived(exams.slice(0, 6));
	const questionCount = $derived(exams.reduce((total, exam) => total + exam.questions.length, 0));
	const displayName = $derived($user?.displayName || ($user?.email ?? 'learner').split('@')[0]);
	const bestScores = $derived.by(() => {
		const m = new Map<string, { score: number; total: number }>();
		for (const r of results) {
			const cur = m.get(r.examId);
			const pct = r.score / r.totalQuestions;
			if (!cur || pct > cur.score / cur.total) m.set(r.examId, { score: r.score, total: r.totalQuestions });
		}
		return m;
	});

	const quest = $derived(dailyData?.dailyQuest ?? null);
	const questPct = $derived(quest ? Math.min(quest.progress / quest.target * 100, 100) : 0);

	async function handleClaimLogin() {
		claimingLogin = true;
		try {
			const res = await claimLogin();
			showLoginModal = false;
			pushToast(`+${res.coinsAwarded} coins — daily login bonus`, 'success');
			if (dailyData) dailyData.loginClaimedToday = true;
			badgeRefresh.update(n => n + 1);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Failed to claim bonus.', 'error');
		}
		finally { claimingLogin = false; }
	}

	async function handleClaimQuest() {
		questClaiming = true;
		try {
			const res = await claimQuest();
			pushToast(`+${res.coinsAwarded} coins — quest completed!`, 'success');
			if (dailyData?.dailyQuest) dailyData.dailyQuest.completed = false; // hide after claim
			badgeRefresh.update(n => n + 1);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Failed to claim quest reward.', 'error');
		}
		finally { questClaiming = false; }
	}

</script>

<svelte:head><title>Dashboard — Qurio</title></svelte:head>

{#if loading}
	<LoadingCard label="Loading your dashboard..." />
{:else}
	<section class="page-stack">
		<div class="card-accent violet">
			<p class="eyebrow">Dashboard</p>
			<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">Ready, {displayName}?</h1>
			<p class="mt-1.5 text-sm leading-6" style="color: var(--text-muted); max-width: 400px;">
				Create a fresh exam or revisit your latest practice set.
			</p>
		</div>

		<div class="stat-grid">
			<div class="stat-card"><p class="value text-white">{exams.length}</p><p class="label">Exams</p></div>
			<div class="stat-card"><p class="value" style="color: var(--cyan);">{questionCount}</p><p class="label">Questions</p></div>
			<div class="stat-card"><p class="value capitalize text-white">{exams[0]?.difficulty ?? '-'}</p><p class="label">Latest difficulty</p></div>
		</div>

		<div class="card" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
			<XpBar />
			<StreakBadge />
		</div>

		<!-- Daily quest -->
		{#if quest}
			<div class="card-sm" style="border: 1px solid rgb(255 200 0 / 0.2);">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background: rgb(255 200 0 / 0.1);">
							<IconRotate size={16} stroke-width={2} style="color: #ffc800;" />
						</div>
						<div>
							<p class="text-xs font-black text-white">{quest.name}</p>
							<p class="text-[0.6rem] font-bold" style="color: var(--text-muted);">{quest.description}</p>
						</div>
					</div>
					{#if quest.completed && !quest.claimed}
						<Button variant="secondary" class="px-3 py-1.5 text-xs" disabled={questClaiming} onclick={handleClaimQuest}>
							{questClaiming ? '...' : `Claim ${quest.reward}`}
							<IconCoin size={12} stroke-width={2} />
						</Button>
					{:else if quest.claimed}
						<span class="flex items-center gap-1 text-[0.6rem] font-bold" style="color: var(--text-muted);">
							<IconCheck size={12} stroke-width={2} /> Claimed
						</span>
					{/if}
				</div>
				<div class="mt-2 flex items-center gap-2">
					<div class="h-1.5 flex-1 rounded-full" style="background: var(--surface-2);">
						<div class="h-full rounded-full" style="width: {questPct}%; background: #ffc800; transition: width 0.3s;"></div>
					</div>
					<span class="text-[0.6rem] font-bold" style="color: var(--text-muted);">{quest.progress}/{quest.target}</span>
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="card-grid card-grid-2">
			<Button href="/generate" class="w-full" style="padding-block: 0.75rem;">
				<IconPlus size={16} stroke-width={2.5} /> Create exam
			</Button>
			<Button href="/results" variant="secondary" class="w-full" style="padding-block: 0.75rem;">
				<IconChartBar size={16} stroke-width={2.5} /> Results history
			</Button>
			<Button href="/mistakes" variant="violet" class="w-full" style="padding-block: 0.75rem;">
				<IconAlertTriangle size={16} stroke-width={2.5} /> Review mistakes ({mistakeCount})
			</Button>
		</div>

		<!-- Recent practice -->
		<div class="card">
			<div class="mb-3 flex items-center justify-between gap-3">
				<h2 class="text-lg font-black text-white">Recent practice</h2>
				<a class="text-xs font-bold" style="color: var(--cyan);" href="/exams">See all</a>
			</div>
			<div class="grid gap-1.5 sm:grid-cols-2">
				{#each recent as exam}
					{@const best = bestScores.get(exam.id)}
					<a class="option cursor-pointer" href={`/exam/${exam.id}`}>
						<div class="flex w-full items-center justify-between gap-3">
							<div class="min-w-0">
								<h3 class="text-sm font-black leading-snug text-white">{exam.title}</h3>
								<p class="mt-0.5 text-xs font-bold" style="color: var(--text-muted);">
									{exam.questions.length} questions
									{#if best}<span style="color: var(--cyan);"> · Best: {best.score}/{best.total}</span>{/if}
									<span style="color: var(--cyan);"> · {inProgress.has(exam.id) ? 'Resume' : 'Start'}</span>
								</p>
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

<!-- Daily login modal -->
{#if showLoginModal}
	<DailyLoginModal
		{loginStreak}
		coinsAwarded={loginCoins}
		onClaim={handleClaimLogin}
		onClose={() => (showLoginModal = false)}
	/>
{/if}
