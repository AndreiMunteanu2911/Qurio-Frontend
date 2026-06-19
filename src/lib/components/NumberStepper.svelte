<script lang="ts">
	import { IconMinus, IconPlus } from '@tabler/icons-svelte';

	let {
		value = $bindable(),
		min = 0,
		max = 100,
		step = 1,
		label,
		disabled = false,
		onChange = () => {}
	} = $props<{
		value: number;
		min?: number;
		max?: number;
		step?: number;
		label: string;
		disabled?: boolean;
		onChange?: (value: number, previousValue: number) => void;
	}>();

	const canDecrement = $derived(!disabled && value > min);
	const canIncrement = $derived(!disabled && value < max);

	function setValue(next: number) {
		const previousValue = value;
		value = Math.min(max, Math.max(min, next));
		onChange(value, previousValue);
	}
</script>

<div class="stepper">
	<span class="stepper-label">{label}</span>
	<div class="stepper-control">
		<button
			type="button"
			class="stepper-button"
			disabled={!canDecrement}
			aria-label={`Decrease ${label}`}
			onclick={() => setValue(value - step)}
		>
			<IconMinus size={14} stroke-width={3} />
		</button>
		<span class="stepper-value">{value}</span>
		<button
			type="button"
			class="stepper-button"
			disabled={!canIncrement}
			aria-label={`Increase ${label}`}
			onclick={() => setValue(value + step)}
		>
			<IconPlus size={14} stroke-width={3} />
		</button>
	</div>
</div>

<style>
	.stepper {
		display: grid;
		gap: 0.375rem;
	}
	.stepper-label {
		font-size: 0.75rem;
		font-weight: 850;
		color: var(--text-muted);
	}
	.stepper-control {
		display: grid;
		grid-template-columns: 2.5rem minmax(3rem, 1fr) 2.5rem;
		align-items: center;
		min-height: 2.85rem;
		border: 2px solid var(--border);
		border-radius: 1rem;
		background: #ffffff;
		box-shadow: 0 5px 0 #d8cfff;
		overflow: hidden;
	}
	.stepper-button {
		display: grid;
		height: 100%;
		min-height: 2.85rem;
		place-items: center;
		background: var(--surface-2);
		color: var(--violet);
	}
	.stepper-button:hover:not(:disabled) {
		background: var(--surface-3);
		color: var(--violet);
	}
	.stepper-button:disabled {
		cursor: not-allowed;
		opacity: 0.35;
	}
	.stepper-value {
		text-align: center;
		font-size: 1rem;
		font-weight: 900;
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}
</style>
