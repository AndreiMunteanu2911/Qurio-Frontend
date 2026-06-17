<script lang="ts">
	import { goto } from '$app/navigation';
	import { generateExam } from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { pushToast } from '$lib/toasts';
	import type { Difficulty } from '$lib/types';

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
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to generate exam.', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Generate Exam — Qurio</title>
</svelte:head>

<section class="page-stack">
	<div class="section-header">
		<p class="eyebrow">Create</p>
		<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
			Turn notes into a quiz.
		</h1>
		<p class="mt-3 text-base leading-7 text-violet-100/72">
			Paste source material, pick the difficulty, and generate a focused exam.
		</p>
	</div>

	<div class="soft-card">
		<div class="grid gap-4">
			<h2 class="text-sm font-bold text-violet-100/72">Difficulty</h2>
			<SegmentedControl bind:value={difficulty} options={difficultyOptions} />
		</div>
	</div>

	<div class="soft-card">
		<form class="grid gap-5" onsubmit={(event) => { event.preventDefault(); submit(); }}>
			<label class="grid gap-2 text-sm font-extrabold text-violet-100">
				Study material
				<textarea
					class="field custom-scrollbar min-h-[20rem] resize-y leading-7"
					bind:value={prompt}
					required
					minlength="20"
					maxlength="8000"
					placeholder="Paste notes, a syllabus section, a concept summary, or a topic..."
				></textarea>
			</label>

			<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#1b1037] px-3 py-2 text-xs font-black text-violet-200">
				<p>{promptLength}/8000 characters</p>
				<p>{promptLength < 20 ? 'Need 20+' : 'Ready'}</p>
			</div>

			<Button type="submit" disabled={loading || promptLength < 20}>
				{loading ? 'Generating...' : 'Generate exam'}
			</Button>
		</form>
	</div>
</section>
