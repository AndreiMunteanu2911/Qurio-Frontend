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
				'theme-card-button rounded-2xl border-2 px-3 py-3 text-sm font-black capitalize',
				value === option
					? 'is-active border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_5px_0_var(--accent-shadow)]'
					: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]'
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
