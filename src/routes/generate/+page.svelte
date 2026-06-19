<script lang="ts">
	import { goto } from '$app/navigation';
	import { generateExam } from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import ModalWrapper from '$lib/components/ModalWrapper.svelte';
	import NumberStepper from '$lib/components/NumberStepper.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { pushToast } from '$lib/toasts';
	import type { Difficulty, ExamSettings, ExplanationMode } from '$lib/types';
	import { IconAdjustments, IconLoader, IconPlayerPlay } from '@tabler/icons-svelte';

	const defaultSettings: ExamSettings = {
		questionCount: 10,
		questionTypeMix: {
			mcq: 6,
			trueFalse: 2,
			fillBlank: 2
		},
		timeLimitMinutes: 10,
		explanationMode: 'immediate'
	};

	let prompt = $state('');
	let difficulty = $state<Difficulty>('medium');
	let questionCount = $state(defaultSettings.questionCount);
	let mcqCount = $state(defaultSettings.questionTypeMix.mcq);
	let trueFalseCount = $state(defaultSettings.questionTypeMix.trueFalse);
	let fillBlankCount = $state(defaultSettings.questionTypeMix.fillBlank);
	let timeLimitMinutes = $state(defaultSettings.timeLimitMinutes);
	let explanationMode = $state<ExplanationMode>(defaultSettings.explanationMode);
	let loading = $state(false);
	let showCustomModal = $state(false);

	const difficultyOptions: Difficulty[] = ['easy', 'medium', 'hard'];
	const explanationOptions: ExplanationMode[] = ['immediate', 'end'];
	const promptLength = $derived(prompt.trim().length);
	const mixTotal = $derived(mcqCount + trueFalseCount + fillBlankCount);
	const canGenerate = $derived(!loading && promptLength >= 20);
	const customSettingsValid = $derived(mixTotal >= 5 && mixTotal <= 20 && timeLimitMinutes >= 3 && timeLimitMinutes <= 60);
	const remainingRoom = $derived(20 - mixTotal);
	const removableCount = $derived(mixTotal - 5);
	const mcqMin = $derived(Math.max(0, mcqCount - removableCount));
	const trueFalseMin = $derived(Math.max(0, trueFalseCount - removableCount));
	const fillBlankMin = $derived(Math.max(0, fillBlankCount - removableCount));
	const mcqMax = $derived(mcqCount + remainingRoom);
	const trueFalseMax = $derived(trueFalseCount + remainingRoom);
	const fillBlankMax = $derived(fillBlankCount + remainingRoom);

	function settingsFromCustom(): ExamSettings {
		return {
			questionCount: mixTotal,
			questionTypeMix: {
				mcq: mcqCount,
				trueFalse: trueFalseCount,
				fillBlank: fillBlankCount
			},
			timeLimitMinutes,
			explanationMode
		};
	}

	async function createExam(settings: ExamSettings) {
		loading = true;
		try {
			const exam = await generateExam(prompt, difficulty, settings);
			pushToast('Exam generated and saved.', 'success');
			goto(`/exam/${exam.id}`);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to generate exam.', 'error');
		} finally {
			loading = false;
		}
	}

	function quickExam() {
		createExam(defaultSettings);
	}

	function customExam() {
		if (!customSettingsValid) return;
		createExam(settingsFromCustom());
	}

	function changeQuestionCount(next: number, previous: number) {
		const diff = next - previous;
		questionCount = next;

		if (diff > 0) {
			mcqCount += diff;
			return;
		}

		let remaining = Math.abs(diff);
		const mcqDrop = Math.min(mcqCount, remaining);
		mcqCount -= mcqDrop;
		remaining -= mcqDrop;

		const trueFalseDrop = Math.min(trueFalseCount, remaining);
		trueFalseCount -= trueFalseDrop;
		remaining -= trueFalseDrop;

		fillBlankCount = Math.max(0, fillBlankCount - remaining);
	}

	function setMcqCount(next: number) {
		mcqCount = next;
		questionCount = mcqCount + trueFalseCount + fillBlankCount;
	}

	function setTrueFalseCount(next: number) {
		trueFalseCount = next;
		questionCount = mcqCount + trueFalseCount + fillBlankCount;
	}

	function setFillBlankCount(next: number) {
		fillBlankCount = next;
		questionCount = mcqCount + trueFalseCount + fillBlankCount;
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
		<div class="grid gap-4">
			<label class="grid gap-1.5 text-xs font-extrabold" style="color: var(--text-muted);">
				Study material
				<textarea
					class="field custom-scrollbar"
					style="min-height: 14rem; resize-y; line-height: 1.6;"
					bind:value={prompt}
					required
					minlength="20"
					maxlength="8000"
					placeholder="Paste notes, a syllabus section, a concept summary, or a topic..."
				></textarea>
			</label>
			<div class="theme-card-button character-counter flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-black">
				<p>{promptLength}/8000 characters</p>
				<p class:ready={promptLength >= 20}>{promptLength < 20 ? 'Need 20+' : 'Ready'}</p>
			</div>
			<div class="grid gap-2 sm:grid-cols-2">
				<Button disabled={!canGenerate} onclick={quickExam}>
					{#if loading}
						<IconLoader size={16} stroke-width={2.5} class="spin" /> Generating...
					{:else}
						Quick exam <IconPlayerPlay size={16} stroke-width={2.5} />
					{/if}
				</Button>
				<Button variant="secondary" disabled={!canGenerate} onclick={() => (showCustomModal = true)}>
					Custom <IconAdjustments size={16} stroke-width={2.5} />
				</Button>
			</div>
		</div>
	</div>
</section>

<ModalWrapper
	open={showCustomModal}
	title="Custom exam"
	description="Choose the exact length, mix, timer, and feedback timing for this exam."
	onClose={() => (showCustomModal = false)}
>
	<div class="grid gap-4">
		<div class="settings-grid">
			<NumberStepper label="Questions" min={5} max={20} bind:value={questionCount} onChange={changeQuestionCount} />
			<NumberStepper label="Minutes" min={3} max={60} bind:value={timeLimitMinutes} />
		</div>

		<div>
			<p class="mb-2 text-xs font-extrabold" style="color: var(--text-muted);">Explanations</p>
			<SegmentedControl bind:value={explanationMode} options={explanationOptions} />
		</div>

		<div>
			<div class="mb-2 flex items-center justify-between gap-2">
				<p class="text-xs font-extrabold" style="color: var(--text-muted);">Question type mix</p>
				<span class={['tag', customSettingsValid ? 'tag-cyan' : 'tag-violet']}>{mixTotal} questions</span>
			</div>
			<div class="settings-grid three">
				<NumberStepper label="Multiple choice" min={mcqMin} max={mcqMax} bind:value={mcqCount} onChange={setMcqCount} />
				<NumberStepper label="True / false" min={trueFalseMin} max={trueFalseMax} bind:value={trueFalseCount} onChange={setTrueFalseCount} />
				<NumberStepper label="Fill blank" min={fillBlankMin} max={fillBlankMax} bind:value={fillBlankCount} onChange={setFillBlankCount} />
			</div>
			{#if !customSettingsValid}
				<p class="mt-2 text-xs font-bold" style="color: var(--incorrect);">Use 5 to 20 total questions.</p>
			{/if}
		</div>
	</div>

	{#snippet footer()}
		<Button variant="ghost" class="flex-1" onclick={() => (showCustomModal = false)}>Cancel</Button>
		<Button class="flex-1" disabled={loading || !customSettingsValid} onclick={customExam}>
			{#if loading}
				<IconLoader size={16} stroke-width={2.5} class="spin" /> Generating...
			{:else}
				Generate custom
			{/if}
		</Button>
	{/snippet}
</ModalWrapper>

<style>
	:global(.spin) {
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to { rotate: 360deg; }
	}
	.settings-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}
	.settings-grid.three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.character-counter {
		color: var(--text-muted);
		box-shadow: 0 4px 0 #070216;
	}
	.character-counter .ready {
		color: var(--accent);
	}
	@media (max-width: 640px) {
		.settings-grid,
		.settings-grid.three {
			grid-template-columns: 1fr;
		}
	}
</style>
