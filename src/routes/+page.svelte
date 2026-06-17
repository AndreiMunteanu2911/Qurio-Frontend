<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Qurio — AI Study Exams</title>
</svelte:head>

<section class="page-stack">
	<div class="card-accent cyan">
		<div style="max-width: 640px;">
			<p class="eyebrow">AI study exams</p>
			<h1 class="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">Study from your own notes.</h1>
			<p class="mt-2 text-sm leading-6" style="color: var(--text-muted); max-width: 480px;">
				Qurio turns dense material into focused exams, instant feedback, and a saved practice library that is easy to revisit.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<Button href="/signup">Start studying</Button>
				<Button href="/login" variant="secondary">Log in</Button>
			</div>
		</div>
	</div>

	<div class="card-grid card-grid-2">
		<div class="card-accent violet">
			<p class="eyebrow">Generated exam</p>
			<h2 class="mt-1.5 text-xl font-black leading-tight text-white">Biology foundations</h2>
			<div class="mt-4">
				<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.375rem;">
					<p class="text-xs font-bold" style="color: var(--text-muted);">Question 4</p>
					<span class="tag tag-cyan">10 questions</span>
				</div>
				<p class="text-lg font-black leading-snug text-white">Which organelle produces most cellular ATP?</p>
				<div class="mt-3 grid gap-1.5">
					<div class="option correct cursor-default"><span class="letter">A</span><span>Mitochondria</span><span class="ml-auto text-xs font-black" style="color: var(--correct);">Selected</span></div>
					<div class="option reveal cursor-default"><span class="letter">B</span><span>Ribosome</span></div>
					<div class="option reveal cursor-default"><span class="letter">C</span><span>Nucleus</span></div>
					<div class="option reveal cursor-default"><span class="letter">D</span><span>Golgi apparatus</span></div>
				</div>
			</div>
		</div>

		<div class="card grid gap-3">
			<p class="eyebrow">How it works</p>
			<div>
				<h3 class="text-base font-black text-white">1. Paste material</h3>
				<p class="mt-0.5 text-sm leading-5" style="color: var(--text-muted);">Copy in notes, a chapter summary, or a topic you want to study.</p>
			</div>
			<div>
				<h3 class="text-base font-black text-white">2. Choose difficulty</h3>
				<p class="mt-0.5 text-sm leading-5" style="color: var(--text-muted);">Easy, medium, or hard — the AI adjusts question depth accordingly.</p>
			</div>
			<div>
				<h3 class="text-base font-black text-white">3. Practice & track</h3>
				<p class="mt-0.5 text-sm leading-5" style="color: var(--text-muted);">Answer questions, review mistakes, and watch your scores improve.</p>
			</div>
		</div>
	</div>
</section>
