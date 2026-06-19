<script lang="ts" generics="T extends string">
	let {
		value = $bindable<T>(),
		options
	} = $props<{
		value: T;
		options: readonly T[];
	}>();
</script>

<div class="segmented" style={`grid-template-columns: repeat(${options.length}, minmax(0, 1fr));`}>
	{#each options as option}
		<button
			type="button"
			class={[
				'rounded-2xl border-2 px-3 py-3 text-sm font-black capitalize',
				value === option
					? 'border-[var(--violet)] bg-[var(--violet)] text-white shadow-[0_5px_0_var(--accent-shadow)]'
					: 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
			]}
			onclick={() => (value = option)}
		>
			{option}
		</button>
	{/each}
</div>

<style>
	.segmented {
		display: grid;
		gap: 0.5rem;
	}
</style>
