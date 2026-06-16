<script lang="ts" generics="T extends string">
	let {
		value = $bindable<T>(),
		options
	} = $props<{
		value: T;
		options: readonly T[];
	}>();
</script>

<div class="grid gap-2" style={`grid-template-columns: repeat(${options.length}, minmax(0, 1fr));`}>
	{#each options as option}
		<button
			type="button"
			class={[
				'rounded-lg border px-3 py-3 text-sm font-extrabold capitalize',
				value === option
					? 'border-white bg-white text-[#12072d]'
					: 'border-transparent bg-[#1b1037] text-violet-100 hover:bg-[#25164a]'
			]}
			onclick={() => (value = option)}
		>
			{option}
		</button>
	{/each}
</div>
