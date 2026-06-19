<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import favicon from '$lib/assets/favicon.png';
</script>

<svelte:head>
	<title>Qurio - AI Study Exams</title>
</svelte:head>

<section class="page-stack public-page">
	<div class="card-accent accent text-center">
		<div class="mx-auto grid h-20 w-20 place-items-center rounded-[1.4rem] border-2" style="border-color: var(--border-strong); background: var(--surface-2); box-shadow: 0 8px 0 #070216;">
			<img src={favicon} alt="" class="h-16 w-16 rounded-2xl" />
		</div>
		<p class="eyebrow mt-5">AI study exams</p>
		<h1 class="mt-3 text-5xl font-black leading-none text-white">Qurio</h1>
		<p class="mx-auto mt-3 max-w-sm text-sm font-bold leading-6" style="color: var(--text-muted);">
			Turn notes into focused quiz rounds, earn progress, and keep your practice streak moving.
		</p>
		<div class="mt-6 grid gap-2">
			<Button href="/signup">Start studying</Button>
			<Button href="/login" variant="secondary">Log in</Button>
		</div>
	</div>

	<div class="card-accent violet">
		<div class="flex items-center justify-between gap-3">
			<div>
				<p class="eyebrow">Daily round</p>
				<h2 class="mt-2 text-xl font-black leading-tight text-white">Biology foundations</h2>
			</div>
			<span class="tag tag-cyan">10 questions</span>
		</div>
		<div class="progress-seg mt-4">
			<div class="seg done"></div>
			<div class="seg done"></div>
			<div class="seg active"></div>
			<div class="seg"></div>
			<div class="seg"></div>
		</div>
		<p class="mt-4 text-lg font-black leading-snug text-white">Which organelle produces most cellular ATP?</p>
		<div class="mt-3 grid gap-2">
			<div class="option correct cursor-default"><span class="letter">A</span><span>Mitochondria</span></div>
			<div class="option reveal cursor-default"><span class="letter">B</span><span>Ribosome</span></div>
			<div class="option reveal cursor-default"><span class="letter">C</span><span>Nucleus</span></div>
			<div class="option reveal cursor-default"><span class="letter">D</span><span>Golgi apparatus</span></div>
		</div>
	</div>

	<div class="card-accent cyan grid gap-3">
		<div class="flex items-center justify-between">
			<p class="eyebrow">Quest path</p>
			<span class="tag tag-violet">Lv. 1</span>
		</div>
		<div class="option cursor-default"><span class="letter">1</span><span>Paste your study material</span></div>
		<div class="option cursor-default"><span class="letter">2</span><span>Pick a difficulty round</span></div>
		<div class="option cursor-default"><span class="letter">3</span><span>Practice, review, and level up</span></div>
	</div>

	<div class="stat-grid">
		<div class="stat-card"><p class="value">XP</p><p class="label">Progress</p></div>
		<div class="stat-card"><p class="value" style="color: var(--cyan);">10</p><p class="label">Questions</p></div>
		<div class="stat-card"><p class="value" style="color: var(--violet);">3</p><p class="label">Steps</p></div>
	</div>
</section>

<style>
	.public-page {
		padding-block: 0.35rem 1rem;
	}
</style>
