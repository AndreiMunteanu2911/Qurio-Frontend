<script lang="ts">
	import { goto } from '$app/navigation';
	import { generateExam } from '$lib/api';
	import { pushToast } from '$lib/toasts';
	import type { Difficulty } from '$lib/types';

	let prompt = $state('');
	let difficulty = $state<Difficulty>('medium');
	let loading = $state(false);

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

<section class="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
	<p class="mb-2 font-bold text-violet-500">Exam Generator</p>
	<h1 class="text-4xl font-black text-slate-900">What should Qurio quiz you on?</h1>
	<p class="mt-3 max-w-2xl text-slate-600">
		Paste notes, describe a topic, or add source material. Qurio will create exactly 10 focused
		multiple-choice questions.
	</p>

	<form class="mt-8 grid gap-6" onsubmit={(event) => { event.preventDefault(); submit(); }}>
		<label class="grid gap-2 font-semibold text-slate-700">
			Prompt or study material
			<textarea
				class="min-h-56 rounded-2xl border-slate-200 p-4 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
				bind:value={prompt}
				required
				minlength="20"
				maxlength="8000"
				placeholder="Paste a chapter summary, lecture notes, or topic description..."
			></textarea>
		</label>

		<div class="grid gap-3 sm:grid-cols-3">
			{#each ['easy', 'medium', 'hard'] as level}
				<button
					type="button"
					class={[
						'pressable rounded-full px-5 py-3 font-black capitalize shadow-lg',
						difficulty === level
							? 'border-b-violet-700 bg-violet-500 text-white'
							: 'border-b-slate-300 bg-slate-50 text-slate-600 hover:bg-white'
					]}
					onclick={() => (difficulty = level as Difficulty)}
				>
					{level}
				</button>
			{/each}
		</div>

		<button
			class="pressable rounded-full border-b-emerald-700 bg-emerald-500 px-7 py-4 font-black text-white shadow-lg hover:bg-emerald-600 disabled:opacity-60"
			disabled={loading}
		>
			{loading ? 'Generating...' : 'Generate Exam'}
		</button>
	</form>
</section>
