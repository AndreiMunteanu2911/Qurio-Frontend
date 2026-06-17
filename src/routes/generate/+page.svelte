<script lang="ts">
	import { goto } from '$app/navigation';
	import { generateExam } from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { pushToast } from '$lib/toasts';
	import type { Difficulty } from '$lib/types';
	import { IconPlayerPlay } from '@tabler/icons-svelte';

	let prompt = $state('');
	let difficulty = $state<Difficulty>('medium');
	let loading = $state(false);
	const difficultyOptions: Difficulty[] = ['easy', 'medium', 'hard'];
	const promptLength = $derived(prompt.trim().length);

	async function submit() {
		loading = true;
		try {
			const exam = await generateExam(prompt, difficulty);
			pushToast('Exam generated and saved.', 'success');
			goto(`/exam/${exam.id}`);
		} catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to generate exam.', 'error'); }
		finally { loading = false; }
	}
</script>

<svelte:head><title>Generate Exam — Qurio</title></svelte:head>

<section class="page-stack">
	<div class="card text-center sm:text-left">
		<p class="eyebrow">Create</p>
		<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">Turn notes into a quiz.</h1>
		<p class="mt-1.5 text-sm leading-6" style="color: var(--text-muted); max-width: 460px;">
			Paste source material, pick the difficulty, and generate a focused exam in seconds.
		</p>
	</div>

	<div class="card">
		<h2 class="mb-2 text-xs font-extrabold" style="color: var(--text-muted);">Difficulty</h2>
		<SegmentedControl bind:value={difficulty} options={difficultyOptions} />
	</div>

	<div class="card">
		<form class="grid gap-4" onsubmit={(event) => { event.preventDefault(); submit(); }}>
			<label class="grid gap-1.5 text-xs font-extrabold" style="color: var(--text-muted);">
				Study material
				<textarea
					class="field custom-scrollbar"
					style="min-height: 14rem; resize-y; line-height: 1.6;"
					bind:value={prompt}
					required minlength="20" maxlength="8000"
					placeholder="Paste notes, a syllabus section, a concept summary, or a topic..."
				></textarea>
			</label>
			<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-black" style="background: var(--surface-2); color: var(--text-muted);">
				<p>{promptLength}/8000 characters</p>
				<p>{promptLength < 20 ? 'Need 20+' : 'Ready'}</p>
			</div>
			<Button type="submit" disabled={loading || promptLength < 20}>
				{loading ? 'Generating...' : 'Generate exam'} <IconPlayerPlay size={16} stroke-width={2.5} />
			</Button>
		</form>
	</div>
</section>
