<script lang="ts">
	let {
		href,
		type = 'button',
		variant = 'primary',
		disabled = false,
		class: className = '',
		onclick,
		children
	} = $props<{
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'violet' | 'danger' | 'ghost';
		disabled?: boolean;
		class?: string;
		onclick?: () => void;
		children: import('svelte').Snippet;
	}>();

	const classes = $derived(
		[
			'pressable inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2.5 text-center text-sm font-extrabold tracking-normal disabled:cursor-not-allowed disabled:opacity-60',
			variant === 'primary' &&
				'border-[#6849ff] bg-[#6849ff] text-white hover:bg-[#765cff]',
			variant === 'secondary' &&
				'border-white bg-white text-[#12072d] hover:bg-violet-50',
			variant === 'violet' &&
				'border-[#4f33dc] bg-[#4f33dc] text-white hover:bg-[#5d43e7]',
			variant === 'danger' &&
				'border-rose-400 bg-rose-500 text-white hover:bg-rose-400',
			variant === 'ghost' &&
				'border-transparent bg-transparent text-violet-100 hover:bg-white/[0.06]',
			className
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href}
	<a class={classes} {href}>
		{@render children()}
	</a>
{:else}
	<button class={classes} {type} {disabled} {onclick}>
		{@render children()}
	</button>
{/if}
