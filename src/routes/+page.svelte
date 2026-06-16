<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<section class="page-stack py-2">
	<div class="section-header">
		<p class="eyebrow">AI study exams</p>
		<h1 class="mt-3 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
			Study from your own notes.
		</h1>
		<p class="mt-3 text-base leading-7 text-violet-100/72">
			Qurio turns dense material into focused exams, instant feedback, and a saved practice library that is easy to revisit.
		</p>

		<div class="mt-5 grid gap-3 sm:grid-cols-2">
			<Button href="/signup">Start studying</Button>
			<Button href="/login" variant="secondary">Log in</Button>
		</div>
	</div>

	<div class="soft-card">
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="eyebrow">Generated exam</p>
				<h2 class="mt-2 text-2xl font-black leading-tight text-white">Biology foundations</h2>
			</div>
			<p class="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-extrabold text-[#12072d]">10</p>
		</div>

		<div class="mt-5">
			<p class="text-sm font-bold text-violet-100/65">Question 4</p>
			<p class="mt-2 text-xl font-black leading-snug text-white">
				Which organelle produces most cellular ATP?
			</p>
			<div class="mt-6 grid gap-3">
				<div class="flex items-center justify-between gap-3 rounded-lg bg-cyan-200/12 p-3 text-sm font-bold text-cyan-100">
					<p>Mitochondria</p>
					<p>Correct</p>
				</div>
				<div class="rounded-lg bg-[#1b1037] p-3 text-sm font-bold text-violet-100/72">Ribosome</div>
				<div class="rounded-lg bg-[#1b1037] p-3 text-sm font-bold text-violet-100/72">Nucleus</div>
				<div class="rounded-lg bg-[#1b1037] p-3 text-sm font-bold text-violet-100/72">Golgi apparatus</div>
			</div>
		</div>
	</div>
</section>
